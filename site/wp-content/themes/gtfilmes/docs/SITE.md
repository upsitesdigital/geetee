# Geeteê Filmes — Como o site funciona

Documentação do site da **Geeteê Filmes** construído sobre o tema/framework **UpWork** (tema `gtfilmes`).
Para a referência genérica do framework (anatomia de módulo, CLI, Form Builder), veja o [README](../README.md).
Para quem edita o conteúdo no painel, veja o [Guia de Uso](GUIA-DE-USO.md).

---

## Sumário

- [Visão geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Fluxo de uma requisição](#fluxo-de-uma-requisição)
- [Roteamento: qual módulo renderiza cada URL](#roteamento-qual-módulo-renderiza-cada-url)
- [Módulos](#módulos)
- [Layout global: Header e Footer](#layout-global-header-e-footer)
- [Formulários (Contact Form 7)](#formulários-contact-form-7)
- [Idiomas (TranslatePress)](#idiomas-translatepress)
- [Opções do Tema](#opções-do-tema)
- [Endpoints REST](#endpoints-rest)
- [Cache](#cache)
- [Responsividade e design](#responsividade-e-design)
- [Plugins utilizados](#plugins-utilizados)
- [Ambiente de desenvolvimento](#ambiente-de-desenvolvimento)
- [Build e deploy](#build-e-deploy)
- [Como fazer tarefas comuns](#como-fazer-tarefas-comuns)
- [Pontos de atenção conhecidos](#pontos-de-atenção-conhecidos)

---

## Visão geral

O site é uma **one-page**: todo o conteúdo público está na Home, e o portfólio é exibido em popups sobre ela.

| Camada | Papel |
|---|---|
| **WordPress** | CMS: a página Home, os **Projetos** (CPT `project`), mídia, usuários e formulários do Contact Form 7. O editor preenche o conteúdo pelos campos **ACF**. |
| **PHP (`app/`, `core/`)** | Cada página/recurso é um **módulo**: registra seus campos ACF e expõe endpoints REST que devolvem o conteúdo em JSON. |
| **React (`resources/`, `app/*/*.view.tsx`)** | SPA que lê o JSON e renderiza a página. Header e Footer são globais. |
| **REST** | Tudo em `/wp-json/framework/v1/...` |

O WordPress **não renderiza HTML de conteúdo**: o filtro `template_include` (`Bootstrap::catchAll`) faz toda URL pública cair no [`index.php`](../index.php), que só monta o "shell" da SPA.

---

## Arquitetura

```
gtfilmes/
├── app/                          ← um diretório por módulo
│   ├── home/
│   │   ├── home.module.php           # #[Module] + campos ACF da Home
│   │   ├── home.controller.php       # GET /home/{id} e GET /forms/cf7/{id}
│   │   ├── home.schema.ts            # tipos TypeScript do JSON
│   │   ├── home.view.tsx             # componente React da Home (todas as seções)
│   │   └── assets/                   # imagens/SVGs estáticos usados pela view
│   ├── project/
│   │   ├── project.module.php        # CPT "Projetos" + taxonomia "Categorias" + campos ACF + seed
│   │   ├── project.controller.php    # /project/categories, /project/list, /project/{id}
│   │   └── assets/                   # imagens dos projetos de exemplo (seed)
│   └── teste/                    # módulo de demonstração do framework
├── core/
│   ├── Framework/   # Bootstrap, ModuleLoader, ModuleRegistry, RouteResolver, Rest, Controller, Attributes
│   ├── Admin/       # Opções do Tema, Module Manager, API de menus, Nonce, PageEditor, Form Builder
│   ├── Support/     # Asset (Vite), Languages (TranslatePress)
│   ├── PostTypes/   # registro de CPTs/taxonomias declarados por atributo
│   └── acf/         # ACF Pro embarcado no tema
├── resources/
│   ├── app.tsx                 # entry point React
│   ├── router.tsx              # React Router (rotas vindas do module-registry)
│   ├── module-registry.ts      # slug → view (gerado automaticamente)
│   ├── components/layout/      # Header, Footer, Layout, LanguageSwitcher
│   ├── components/shared/      # AttachmentFormModal, DynamicForm, ErrorBoundary, ScrollToTop
│   ├── hooks/                  # useModule, useCurrentRoute, useDocumentTitle
│   ├── lib/                    # api, env (FW_BOOT), cn
│   ├── assets/                 # logo, ícone do menu, swirl e seta do rodapé
│   ├── fonts/goldplay-alt/     # fonte do site
│   └── styles/globals.css      # fontes, estilos dos formulários CF7, utilitários
├── public/build/               # saída do Vite (gerada, fora do git)
├── bin/                        # make-module.php, sync-modules.php
├── index.php                   # shell HTML da SPA (SEO + FW_BOOT)
└── functions.php               # carrega ACF, Composer, Bootstrap, menus, assets do CF7
```

> O módulo `project` **não tem view**: ele só fornece dados. Quem exibe os projetos é a Home.

---

## Fluxo de uma requisição

```
Navegador → /
   │
   ├─ WordPress → template_include → index.php (shell)
   │     ├─ <title>, meta description, Open Graph (excerpt e imagem destacada da página)
   │     └─ window.FW_BOOT = { apiBase, wpApiBase, siteUrl, themeUrl, nonce,
   │                           themeOptions, currentPath, currentRoute, languages }
   │           └─ currentRoute = RouteResolver::current() → { module: 'home', pageId, url, title }
   │
   └─ React (resources/app.tsx)
         ├─ Layout = Header + <View do módulo> + Footer
         ├─ useModule('home') → GET /framework/v1/home/{pageId}
         ├─ GET /project/categories           → botões de categoria
         ├─ GET /project/list/{categoria}?page → grade de projetos (8 por página)
         ├─ GET /forms/cf7/{id}               → HTML do formulário de orçamento
         └─ ao clicar num projeto: GET /project/{id} → popup
```

Diferente de outros projetos UpWork, **não há preload** no shell: a Home mostra um skeleton enquanto o JSON chega. O `pageId` vem do `FW_BOOT.currentRoute`; em navegação client-side para outra URL, `useCurrentRoute` consulta `GET /framework/v1/route?path=`.

---

## Roteamento: qual módulo renderiza cada URL

**No servidor** — [`core/Framework/RouteResolver.php`](../core/Framework/RouteResolver.php), nesta ordem:

| # | Condição | Módulo |
|---|---|---|
| 1 | Page com Modelo **"Página · X"** (`fw:x`) | o módulo `x` |
| 2 | Página inicial (Configurações → Leitura) | `home` |
| 3 | Qualquer outra coisa | `null` → o React mostra a tela 404 |

**No cliente** — [`resources/router.tsx`](../resources/router.tsx) monta uma rota para cada entrada de [`module-registry.ts`](../resources/module-registry.ts) (`/` → Home, `/teste` → Teste) e um `*` que exibe "404 — Página não encontrada".

> O Modelo é escolhido no editor da página (**Atributos da página → Modelo**). Páginas com Modelo de módulo não exibem o editor de conteúdo nativo (`Core\Admin\PageEditor`) — o conteúdo vem só dos campos ACF.

---

## Módulos

### Home — `app/home` · Modelo "Página · Home" · `#[Required]`

Seções, em ordem (os `id` são as âncoras usadas pelo menu do header):

1. **Hero (Demo Reel)** — card escuro com o título gigante em duas linhas preenchido por uma **textura** (imagem aplicada com `background-clip: text`), descrição e indicador "Scroll". O fundo pode ser **nenhum, imagem, vídeo MP4/WebM ou vídeo do YouTube**, sempre com uma camada escura de 50% por cima.
   - MP4: `<video autoplay muted loop playsinline>`.
   - YouTube: carregado pela IFrame API (`youtube-nocookie.com`), sem controles, sem som e em loop; só aparece 3,5 s depois de começar a tocar, para esconder o botão de play do player. O ID é extraído de links `watch?v=`, `youtu.be/`, `embed/`, `shorts/` e `live/`.
2. **Filtro de categorias** — um botão por termo da taxonomia `categories` (ordem de criação, `term_id ASC`). A **primeira categoria** já vem selecionada.
3. **Portfólio** (`#portfolio`) — grade com os projetos da categoria ativa, mais recentes primeiro, **8 por vez** com "Carregar mais" (`useInfiniteQuery`). No desktop, quando há mais páginas, a grade é cortada logo abaixo da 1ª linha e o botão redondo rosa fica sobreposto. Clicar na imagem ou no título abre o **popup do projeto**.
   - **Popup:** logo, título, subtítulo, descrição completa e os **blocos** do projeto (texto, vídeo, imagens). Imagens e vídeos abrem num **lightbox** em tela cheia. Vídeos aceitam YouTube, Vimeo (viram `iframe` com autoplay) ou arquivo direto (`<video controls>`).
4. **Nossos amigos** (`#amigos`) — emblema, título em duas linhas (a 2ª em rosa) e logos dos clientes em escala de cinza. Desktop/tablet: slider paginado com bolinhas, 30 logos por página e avanço automático a cada 10 s. Mobile (< 640px): faixa contínua estilo *marquee*.
5. **Solicite um orçamento** (`#orcamento`) — título, subtítulo, descrição e o formulário do **Contact Form 7** (ID configurável, padrão `22`).
6. **Estatística** — números grandes que se alternam a cada 5 s com *fade*. Desktop/tablet usa a foto fixa `app/home/assets/stats-bg.jpeg`; no celular, a imagem cadastrada no campo **Imagem de fundo (mobile)** aparece no topo da seção.
7. **Fale com a gente** (`#fale`) — imagem fixa (`fale-work.png`), título, lista de redes sociais e link "Conheça um pouco do nosso time".
8. **Time** (`#equipe`) — carrossel horizontal com foto, nome, cargo e bio. Bolinhas de paginação e, no desktop, seta grande que avança (e volta ao início no fim).

| Grupo ACF | Campos |
|---|---|
| Home — Hero (Demo Reel) | `hero_titulo_linha1`, `hero_titulo_linha2`, `hero_titulo_textura`, `hero_descricao`, `hero_midia_tipo` (`nenhuma` / `imagem` / `video` / `youtube`), `hero_midia_imagem`, `hero_midia_video`, `hero_midia_youtube` |
| Home — Nossos Amigos | `amigos_badge`, `amigos_titulo_linha1`, `amigos_titulo_linha2`, `amigos_descricao`, `amigos_logos` (repeater: `logo`, `nome`) |
| Home — Solicite um Orçamento | `orcamento_titulo_linha1`, `orcamento_titulo_linha2`, `orcamento_subtitulo`, `orcamento_descricao`, `orcamento_form_id` |
| Home — Estatística | `stats_itens` (repeater: `numero`, `descricao`), `stats_imagem_mobile` |
| Home — Fale com a Gente | `fale_titulo_linha1`, `fale_titulo_linha2`, `fale_redes` (repeater: `nome`, `url`), `fale_time_texto`, `fale_time_url` |
| Home — Time | `time_membros` (repeater: `foto`, `nome`, `cargo`, `bio`) |

**Valores de fallback** (aplicados pelo controller quando o campo/lista está vazio):

| Campo vazio | O que aparece |
|---|---|
| `hero_titulo_textura` | `app/home/assets/hero-demo-reel-texture.png` |
| `amigos_badge` | `resources/assets/header/badge.svg` |
| `fale_redes` | instagram, facebook, youtube, linkedin (sem link) |
| `stats_itens` | +4000 projetos, +100 clientes, +10 anos |
| `stats_imagem_mobile` | `app/home/assets/stats-bg-mobile.png` |
| `time_membros` | Marco Falkembach, Pedro Lanfranchi, Gustavo Rosseb (sem foto) |
| `orcamento_form_id` | `22` |

Seções que **somem** quando vazias: título/descrição do hero, filtro de categorias (sem categorias), portfólio (categoria sem projetos), logos (sem logos), estatística (sem itens — mas há fallback), time (sem membros — mas há fallback).

### Projetos — `app/project` · CPT `project` · `#[Required]`

Declarado por atributos no módulo:

- **CPT `project`** ("Projetos", ícone portfólio, suporta `title` e `thumbnail`).
- **Taxonomia `categories`** ("Categorias", hierárquica, `showInRest: false`).

| Campo | Tipo | Onde aparece |
|---|---|---|
| Título do post | — | card e popup |
| Imagem destacada | — | imagem do card (tamanho `large`) |
| `subtitulo` | textarea | card, popup e lightbox |
| `logo` | imagem | círculo ao lado do título (branco se vazio) |
| `descricao_completa` | textarea | topo do popup, ao lado do título |
| `conteudo` | flexible content | corpo do popup |

Layouts do `conteudo`:

| Layout | Subcampos | Renderização |
|---|---|---|
| `texto` | `texto` (WYSIWYG básico, sem mídia) | HTML com links rosa e listas |
| `video` | `video_url`, `thumbnail` | capa com botão play → lightbox |
| `imagens` | `imagens` (galeria, 1 a 3) | lado a lado: 1 = 100%, 2 = 50/50, 3 = 33/34/33 |

**Seed automático** (`ProjectModule::boot`, roda em todo `init`):

- Se a taxonomia **não tem nenhum termo**, cria: Rec Brand, Rec Nature, Motion 2D, 3D, Design, Illustration, Photography, Sound Design.
- Se **não existe nenhum projeto** (qualquer status exceto lixeira), cria 8 projetos de exemplo na categoria "Rec Brand", com as imagens de `app/project/assets/` enviadas para a Mídia.

### Teste — `app/teste`

Módulo de demonstração que veio com o framework (`/teste`, Modelo "Página · Teste"). Não faz parte do site; pode ser desativado em **UpWork → Módulos**.

---

## Layout global: Header e Footer

Ficam em [`resources/components/layout/`](../resources/components/layout/) e aparecem em todas as páginas.

### Header

- Fixo no topo (`sticky`), fundo branco. Logo à esquerda (Opções do Tema → Logo; sem logo, usa `resources/assets/header/logo.svg`).
- **Botões "Manda Portfólio" e "Manda Jobs"** (≥ 768px): não navegam — abrem um painel lateral ([`AttachmentFormModal`](../resources/components/shared/AttachmentFormModal.tsx)) com o formulário CF7 **#mandaportifa** (ID padrão `33`) ou **#mandajobs** (ID padrão `32`). O campo de arquivo do CF7 é trocado por um widget "Anexar".
- **Seletor de idiomas** (bandeira) — ver [Idiomas](#idiomas-translatepress).
- **Menu hambúrguer** — dropdown com links **fixos no código** (`NAV_LINKS`): Nosso portfólio (`#portfolio`), Nossos amigos (`#amigos`), Conheça nossa equipe (`#equipe`), Contato (`#contato`) e o botão "Solicite um orçamento" (`#orcamento`). Na Home rola suavemente até a seção; em outra página vai para `/#âncora`. No celular, os dois botões do header aparecem dentro do dropdown.

### Footer

Fundo rosa (`#EC0076`) com o *swirl* decorativo (à esquerda no desktop, abaixo do conteúdo no mobile). Tem `id="contato"` (destino do link "Contato" do menu).

Conteúdo, todo vindo das Opções do Tema com fallback fixo: título ("contato"), e-mail 1, e-mail 2 (ambos `mailto:`), telefone (`tel:`), cidade e texto de direitos autorais (aceita HTML).

---

## Formulários (Contact Form 7)

Os três formulários do site são do **Contact Form 7**, injetados na SPA:

| Formulário | Onde | ID definido em | Padrão |
|---|---|---|---|
| Solicitar Orçamento | Seção `#orcamento` da Home | campo ACF `orcamento_form_id` | 22 |
| #mandaportifa | Botão "Manda Portfólio" do header | Opções do Tema → `header_portfolio_form_id` | 33 |
| #mandajobs | Botão "Manda Jobs" do header | Opções do Tema → `header_jobs_form_id` | 32 |

Como funciona:

1. A view chama `GET /framework/v1/forms/cf7/{id}` (definido em `HomeController::cf7Form`), que devolve `wpcf7_contact_form($id)->form_html()`.
2. O HTML é injetado e o React chama `wpcf7.init(form)` e carrega o schema de validação em `/wp-json/contact-form-7/v1/contact-forms/{id}/feedback/schema`.
3. Como o CF7 não detecta shortcode na página, o [`functions.php`](../functions.php) força o `wpcf7_enqueue_scripts()` / `wpcf7_enqueue_styles()` em todas as páginas.
4. O envio, a validação e os e-mails são 100% do CF7. As mensagens recebidas ficam salvas pelo plugin **Contact Form 7 Database**.

Estilos: `.cf7-form` (fundo escuro, seção de orçamento) e `.cf7-form-light` (painéis do header) em [`globals.css`](../resources/styles/globals.css).

> O framework também tem um **Form Builder** próprio (CPT `fw_form`, **UpWork → Formulários**, componente `DynamicForm`), mas ele **não é usado** neste site.

---

## Idiomas (TranslatePress)

- [`core/Support/Languages.php`](../core/Support/Languages.php) lê `trp_settings` e envia ao React, em `FW_BOOT.languages`, cada idioma publicado (código, slug, URL base, bandeira e se é o atual).
- O [`LanguageSwitcher`](../resources/components/layout/LanguageSwitcher.tsx) só aparece com **2 ou mais idiomas publicados**. Trocar de idioma **recarrega a página** na URL do idioma (`/en/...`), mantendo caminho, query e âncora.
- Sem o plugin ativo, a lista é vazia e o seletor não aparece.

---

## Opções do Tema

**WP Admin → UpWork → Opções do Tema** (option `upwork_theme_options`). Tudo é exposto ao React em `FW_BOOT.themeOptions` e lido sem passar pelo cache REST.

| Chave | Rótulo no painel | Uso |
|---|---|---|
| `site_name` | Nome do Site | `alt` do logo (padrão "Geeteê filmes") |
| `logo_url` / `logo_id` | Logo | Logo do header |
| `primary_color` | Cor Primária | Injeta `--theme-primary` no `<head>`; **não é usado pelos componentes** |
| `header_cta_1_text` | Header — Botão 1 (texto) | Texto do botão "Manda Portfólio" |
| `header_cta_1_url` | Header — Botão 1 (link) | Não usado (o botão abre formulário) |
| `header_portfolio_form_id` | ID do formulário #mandaportifa | Formulário do botão 1 |
| `header_cta_2_text` | Header — Botão 2 (texto) | Texto do botão "Manda Jobs" |
| `header_cta_2_url` | Header — Botão 2 (link) | Não usado (o botão abre formulário) |
| `header_jobs_form_id` | ID do formulário #mandajobs | Formulário do botão 2 |
| `footer_titulo` | Footer — Título | Título do rodapé |
| `footer_email_1`, `footer_email_2` | Footer — E-mail 1 / 2 | Links `mailto:` |
| `footer_telefone` | Footer — Telefone | Link `tel:` (só dígitos e `+`) |
| `footer_cidade` | Footer — Cidade | Texto simples |
| `footer_text` | Footer — Texto de direitos autorais | HTML básico |

Qualquer campo vazio usa o valor padrão fixo no componente (`Header.tsx` / `Footer.tsx`).

---

## Endpoints REST

Todos públicos, em `/wp-json/framework/v1`:

| Método | Rota | Cache | Retorno |
|---|---|---|---|
| GET | `/home` · `/home/{id}` | 300 s | JSON da Home (sem `id`, usa a página inicial) |
| GET | `/forms/cf7/{id}` | — | `{ html }` do formulário CF7 |
| GET | `/project/categories` | 300 s | `[{ id, name, slug, count }]` |
| GET | `/project/list/{categoria}?page=N` | 300 s | `{ items: [...], hasMore }` (8 por página) |
| GET | `/project/{id}` | 300 s | detalhe do projeto com `blocos` |
| GET | `/route?path=` | — | módulo/página de um caminho |
| GET | `/menus/{localização}` | — | árvore do menu (não usado pelo layout atual) |
| GET | `/nonce` | — | renova o nonce REST (usado por `api.ts` ao receber 401) |
| GET | `/teste` · `/teste/{id}` | — | módulo de demonstração |

---

## Cache

- **Cache REST:** os endpoints com `#[Cache(ttl: 300)]` salvam a resposta em transients `fw_rest_*` (chave = rota + parâmetros). O cache inteiro é limpo ao **salvar ou excluir qualquer post** (página, projeto, formulário CF7…) — `Bootstrap::clearRestCache`.
- **Exceção:** criar, renomear ou excluir **categorias** não dispara `save_post`; a lista de categorias pode levar até **5 minutos** para atualizar (ou atualiza ao salvar qualquer projeto).
- **Cliente:** o TanStack Query mantém os dados por 60 s (módulos) e 5 min (categorias, listas, detalhes e formulários) dentro da mesma visita.

---

## Responsividade e design

- **Breakpoints Tailwind padrão.** Os que mais mudam o layout:
  - `sm` (640px): marquee de logos ↔ slider; imagem mobile da estatística ↔ foto de fundo; swirl do rodapé abaixo ↔ ao lado.
  - `md` (768px): botões do header aparecem na barra (antes ficam no dropdown); indicador "Scroll" do hero.
  - `lg` (1024px): hero com título e descrição lado a lado; corte da grade do portfólio com botão sobreposto; seta grande do Time.
- **Fonte:** *Goldplay Alt*, local em `resources/fonts/goldplay-alt/` (`@font-face` em `globals.css`), definida como `font-sans`.
- **Cores** (usadas direto nas classes, sem tokens nomeados):

| Cor | Uso |
|---|---|
| `#EC0076` | rosa da marca: botões, destaques, títulos linha 2, rodapé, bolinhas |
| `#210000` | fundo do hero e da camada sobre a mídia |
| `#000000` | fundo do portfólio, orçamento e "Fale com a gente" |
| `#1A1A1A` | títulos em fundo claro |
| `#4D4D4D` | textos de apoio, links do menu |
| `#670838` | cargo dos membros do time |
| `#F7F7F7` | hover do menu, fundo dos painéis de formulário |

- Os tokens shadcn (`primary`, `muted`, `border`…) existem no `tailwind.config.js`, mas são pouco usados (skeletons e textos de erro).
- Layout de referência: Figma do projeto Geeteê Filmes. O comando `/bob` (em `.claude/commands/bob.md`) implementa um frame do Figma como módulo.

---

## Plugins utilizados

| Plugin | Para quê |
|---|---|
| **ACF Pro** | Embarcado em `core/acf/` (não precisa instalar). Se o plugin também estiver ativo, ele prevalece. |
| **Contact Form 7** | Os 3 formulários do site |
| **Contact Form 7 Database** | Guarda as mensagens enviadas no painel |
| **TranslatePress** (+ Business) | Idiomas e seletor de bandeiras |
| **Safe SVG** | Permite enviar SVG à Mídia (logos, ícones) |
| **Classic Editor** | Editor clássico no painel |
| **Duplicate Post** | Duplicar projetos/páginas |
| **All-in-One WP Migration** | Migração/backup do site |

---

## Ambiente de desenvolvimento

Requisitos: PHP 8.1+, Composer, Node 18+, WordPress 6+ (local: XAMPP).
Os campos ACF são registrados **sempre via código** (`*.module.php`), nunca pela interface do ACF.

```bash
composer install     # autoload PSR-4 (vendor/)
npm install
npm run dev          # Vite em http://localhost:5173 com HMR
```

Com o `npm run dev` ativo, o Vite grava `public/build/hot` e o tema passa a carregar os assets do dev server. Ao parar o servidor, o arquivo é removido e o tema volta a usar o build.

| Comando | O que faz |
|---|---|
| `npm run dev` | Sincroniza módulos e sobe o Vite (HMR) |
| `npm run build` | Sincroniza módulos, checa tipos (`tsc -b`) e gera `public/build/` |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `composer fw:make:module <slug>` | Cria um módulo novo com os 4 arquivos |
| `composer fw:sync-modules` | Regera `resources/module-registry.ts` |

---

## Build e deploy

`public/build/` e `vendor/` estão no `.gitignore`. Portanto, **todo deploy precisa gerar os dois**:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

Se o build for feito localmente e só os arquivos forem enviados ao servidor, inclua `public/build/` (com `.vite/manifest.json`) e `vendor/` no upload. Garanta também que **não** exista `public/build/hot` no servidor, senão o tema tentará carregar os assets de `localhost:5173`.

Depois do deploy, confira no painel:

- **Configurações → Leitura:** página inicial estática apontando para a página com Modelo "Página · Home".
- **Contato → Formulários de contato:** os IDs dos 3 formulários batem com o campo `orcamento_form_id` e com as Opções do Tema (os IDs mudam ao recriar formulários em outro ambiente).

---

## Como fazer tarefas comuns

**Adicionar um campo a uma seção da Home**
1. Adicione o campo no grupo certo em `home.module.php` (key `field_home_{nome}`).
2. Leia e devolva o valor no `index()` de `home.controller.php`.
3. Acrescente o tipo em `home.schema.ts` e use na seção correspondente de `home.view.tsx`.
4. `npm run build`.

**Adicionar um novo tipo de bloco ao popup do projeto**
1. Novo layout em `conteudo` (`project.module.php`).
2. Trate o `acf_fc_layout` em `ProjectController::show`.
3. Adicione o tipo em `ProjectBlock` e o render em `ProjectBlockView` (`home.view.tsx`).

**Criar uma nova página com layout próprio**
1. `composer fw:make:module minha-pagina` → cria `app/minha-pagina/`.
2. Campos ACF no `.module.php`, dados no controller, tipos no `.schema.ts`, layout no `.view.tsx`.
3. `npm run build`.
4. No admin: criar Page → Modelo "Página · MinhaPagina" → preencher os campos.

**Trocar a foto fixa da Estatística (desktop) ou do "Fale com a gente":** substitua `app/home/assets/stats-bg.jpeg` / `fale-work.png` e rode `npm run build` (não são campos ACF).

**Mudar os links do menu hambúrguer:** edite `NAV_LINKS` em `resources/components/layout/Header.tsx`.

---

## Pontos de atenção conhecidos

- **Seed dos projetos:** se **todos** os projetos forem excluídos permanentemente, os 8 projetos de exemplo são recriados no próximo carregamento. O mesmo vale para as categorias: apagar todas recria as 8 padrão. Deixe ao menos um projeto/categoria (pode ser rascunho) ou remova o seed de `ProjectModule::boot`.
- **URLs individuais de projeto** (`/project/slug/`) existem porque o CPT é público, mas não há módulo para elas: abrem a tela 404 do React com status HTTP 200. Os projetos só são vistos pelo popup da Home.
- **Menus do WordPress** (`primary` e `footer`) estão registrados e têm endpoint, mas **o header e o rodapé não os usam** — os links do menu são fixos no código.
- **Cor Primária** e os **links dos botões do header** nas Opções do Tema não têm efeito no layout atual.
- **Imagens fixas no código:** fundo desktop da Estatística (`stats-bg.jpeg`) e imagem do "Fale com a gente" (`fale-work.png`) não podem ser trocadas pelo painel.
- **IDs dos formulários CF7** são fixos por ambiente; ao migrar ou recriar formulários, atualize os IDs na Home e nas Opções do Tema.
- **Tradução:** o conteúdo da SPA chega via REST e é montado no navegador. Ao publicar um novo idioma, confira se todos os textos (inclusive os dos campos ACF e dos projetos) aparecem traduzidos.
- **Módulo `teste`:** é só demonstração; pode ser desativado em UpWork → Módulos.
- **Assets de exemplo:** as imagens em `app/project/assets/` só servem para o seed; `app/home/assets/amigos-logos.jpeg` é referência do Figma e não é usada pelo código.
