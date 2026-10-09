# Guia de Uso do Site Geeteê Filmes

Atualizado em 09/10/2026 · Documentação técnica: [SITE.md](SITE.md)

Todo o conteúdo do site é editado no painel do WordPress. O site tem uma única página (a Home), dividida em seções, e um portfólio de **Projetos** que abrem em uma janela por cima da Home. Este guia mostra onde fica cada campo e como preenchê-lo.

## Sumário

1. [Acesso ao painel](#1-acesso-ao-painel)
2. [Como preencher cada tipo de campo](#2-como-preencher-cada-tipo-de-campo)
3. [A Home, seção por seção](#3-a-home-seção-por-seção)
4. [Projetos do portfólio](#4-projetos-do-portfólio)
5. [Categorias do portfólio](#5-categorias-do-portfólio)
6. [Formulários e mensagens recebidas](#6-formulários-e-mensagens-recebidas)
7. [Opções do Tema (topo e rodapé)](#7-opções-do-tema-topo-e-rodapé)
8. [Idiomas](#8-idiomas)
9. [Problemas comuns](#9-problemas-comuns)

## 1. Acesso ao painel

Entre em **seudominio.com.br/wp-admin** com seu usuário e senha. Tudo o que o visitante vê está em um destes menus do lado esquerdo:

| Menu do painel | O que você edita ali |
| --- | --- |
| **Páginas → Home** | Todas as seções da página inicial (hero, amigos, orçamento, números, redes, time) |
| **Projetos** | Os trabalhos do portfólio e suas categorias |
| **Mídia** | Todas as imagens, logos e vídeos enviados |
| **Contato** | Os formulários (orçamento, #mandajobs, #mandaportifa) e as mensagens recebidas |
| **UpWork → Opções do Tema** | Logo, textos dos botões do topo e dados do rodapé |
| **TranslatePress** | Idiomas do site |

Para editar a Home: **Páginas → passe o mouse sobre "Home" → Editar**. Os campos aparecem agrupados por seção (Hero, Nossos Amigos, Solicite um Orçamento...). Depois de mudar, clique em **Atualizar** (canto superior direito).

## 2. Como preencher cada tipo de campo

Saber como cada tipo de campo se comporta evita quase todos os problemas.

| Tipo | Como aparece no painel | Como preencher |
| --- | --- | --- |
| **Texto** | Uma linha | Texto curto: títulos, nomes, textos de link |
| **Área de texto** | Caixa com várias linhas | Parágrafos e descrições |
| **Texto formatado** | Caixa com barra de negrito, itálico, lista e link | Usado nos blocos de texto dos projetos |
| **Link** | Uma linha | Endereço completo, começando com https:// (ex.: https://instagram.com/gtfilmes) |
| **Imagem** | Botão "Adicionar imagem" | Escolha da Mídia ou envie do computador. Preencha o **Texto alternativo** da imagem na Mídia |
| **Galeria** | Botão "Adicionar à galeria" | Selecione várias imagens de uma vez; arraste para reordenar |
| **Lista de itens** (repetidor) | Linhas numeradas + botão "Adicionar..." | Cada linha é um logo, número, rede ou pessoa. Arraste pelo número para reordenar; use o **−** para remover |
| **Escolha** | Botões lado a lado | Escolha uma opção; os campos abaixo mudam conforme a escolha |
| **Número** | Campo numérico | Usado só para o ID de formulário |

Regras que valem para o site todo:

- **Campo vazio = item escondido.** Um título sem texto não aparece; uma lista sem itens esconde a parte dela.
- **Algumas listas têm conteúdo de exemplo.** Se a lista de **Estatística**, **Redes sociais** ou **Time** ficar vazia, o site mostra os itens originais do layout em vez de sumir. Para trocar, basta cadastrar os seus.
- **Títulos em duas linhas:** a maioria dos títulos tem um campo **linha 1** e outro **linha 2** — cada um é uma linha na tela. A linha 2 normalmente aparece em rosa, com uma seta ao lado.
- **Ícones e logos:** envie SVG ou PNG com fundo transparente.

## 3. A Home, seção por seção

Os grupos de campos seguem a ordem das seções na tela, de cima para baixo. O nome antes do travessão no grupo ("Home — Time") diz a qual seção ele pertence.

| Seção | Campos | Dicas |
| --- | --- | --- |
| **Hero (Demo Reel)** — o card escuro do topo | Título (linha 1), Título (linha 2), Textura do título, Descrição, **Mídia de fundo** | O título gigante é "pintado" com a **Textura**: use uma imagem colorida e com bastante detalhe. Sem textura, o site usa a original |
| | **Mídia de fundo**: Nenhuma, Imagem, Vídeo (arquivo MP4) ou Vídeo do YouTube | Escolha o tipo e preencha o campo que aparece abaixo. O vídeo roda **sem som, em loop e sem controles**, com uma camada escura por cima. **MP4**: até ~15 MB e 1920 px de largura. **YouTube**: cole o link do vídeo (ex.: https://www.youtube.com/watch?v=XXXXXXXXXXX); ele aparece alguns segundos depois de carregar |
| **Categorias + Portfólio** | — | Vêm do menu **Projetos** (seções 4 e 5) |
| **Nossos amigos** | Ícone / emblema da marca, Título (linha 1), Título (linha 2, destaque rosa), Descrição, **Logos de clientes/parceiros** (Logo + Nome) | Os logos aparecem em tons de cinza e passam sozinhos a cada 10 segundos. O **Nome** não aparece na tela: é o texto lido por leitores de tela. Use logos com fundo transparente e sem margem sobrando |
| **Solicite um orçamento** | Título (linha 1), Título (linha 2, destaque rosa), Subtítulo, Descrição, **ID do formulário (Contact Form 7)** | O formulário em si é editado em **Contato** (seção 6). Só mude o ID se trocar de formulário |
| **Estatística** — números grandes sobre fundo rosa/foto | **Itens** (Número + Descrição), Imagem de fundo (mobile) | Os números se alternam sozinhos a cada 5 segundos. A **Imagem de fundo (mobile)** só aparece no celular, no topo da seção. A foto do computador é fixa no layout |
| **Fale com a gente** | Título (linha 1), Título (linha 2, com seta ao lado), **Redes sociais** (Nome + Link), Texto do link "time", Link do "time" | Cada rede aparece como uma linha grande, clicável se tiver Link. A foto desta seção é fixa no layout |
| **Time** | **Membros** (Foto, Nome, Cargo, Bio) | Aparece como carrossel. Use fotos verticais (retrato), todas com o mesmo enquadramento |

## 4. Projetos do portfólio

Cada trabalho do portfólio é um **Projeto**. Na Home, ele aparece como um card (imagem, logo, nome e subtítulo); ao clicar, abre uma janela com o conteúdo completo.

**Para cadastrar um projeto:**

1. **Projetos → Adicionar novo.**
2. **Título:** nome do projeto (aparece no card e na janela).
3. No painel da direita:
    - **Imagem destacada:** a imagem do card. Sem ela, o card fica cinza. Use imagens na mesma proporção em todos os projetos.
    - **Categorias:** marque a categoria em que ele deve aparecer (seção 5). Pode marcar mais de uma.
4. Preencha os campos abaixo do título:

| Campo | Onde aparece | Dicas |
| --- | --- | --- |
| Subtítulo / Descrição curta | Embaixo do nome, no card e na janela | Uma ou duas linhas |
| Logo do cliente (círculo) | Círculo ao lado do nome | Imagem quadrada. Vazio = círculo branco |
| Descrição completa (popup do projeto) | Topo da janela, ao lado do título | Um parágrafo de introdução |
| **Conteúdo do popup (blocos)** | Corpo da janela | Veja abaixo |

5. Clique em **Publicar**.

**Montando o conteúdo do popup:** clique em **Adicionar bloco** e escolha o tipo. Empilhe quantos blocos quiser, na ordem que quiser; arraste para reordenar.

| Bloco | O que preencher | Como aparece |
| --- | --- | --- |
| **Texto** | Texto com negrito, itálico, listas e links | Parágrafo na largura da janela |
| **Vídeo** | URL do vídeo (YouTube, Vimeo ou link de um arquivo .mp4) e Capa | Mostra a Capa com um botão de play; ao clicar, o vídeo abre em tela cheia. **Sempre envie uma Capa**, senão o bloco fica cinza |
| **Imagens** | De 1 a 3 imagens | 1 imagem = largura total; 2 = metade cada; 3 = um terço cada. Clicar abre a imagem em tela cheia |

**Ordem e quantidade:** os projetos aparecem do **mais recente para o mais antigo** (pela data de publicação). A Home mostra 8 por vez e um botão para carregar mais. Para subir um projeto antigo, mude a data de publicação dele.

**Para tirar um projeto do site:** mude-o para **Rascunho** ou mova para a lixeira.

> **Atenção:** não apague *todos* os projetos de uma vez. Se o site ficar sem nenhum projeto, ele recria automaticamente os 8 projetos de exemplo ("Nome do projeto de Rec Brand"). Cadastre os novos antes de remover os de exemplo.

## 5. Categorias do portfólio

As categorias são os botões acima do portfólio (Rec Brand, Motion 2D, 3D...). Ficam em **Projetos → Categorias**.

- **A primeira categoria** da lista é a que já vem aberta quando alguém entra no site.
- A ordem dos botões é a **ordem em que as categorias foram criadas**. Para mudar a ordem, é preciso recriar as categorias na sequência desejada (ou pedir ao desenvolvedor).
- Uma categoria sem projetos aparece como botão, mas ao clicar não mostra nada. Apague ou deixe de usar categorias vazias.
- Mudanças nas categorias podem levar até **5 minutos** para aparecer no site.
- Assim como os projetos, não apague *todas* as categorias: o site recria as 8 originais.

## 6. Formulários e mensagens recebidas

O site tem três formulários, todos do plugin **Contact Form 7** (menu **Contato → Formulários de contato**):

| Formulário | Onde aparece |
| --- | --- |
| Solicitar Orçamento | Seção "Solicite um orçamento" da Home |
| #mandaportifa | Botão **Manda Portfólio** do topo (abre um painel lateral com anexo) |
| #mandajobs | Botão **Manda Jobs** do topo (abre um painel lateral com anexo) |

- **Editar campos, e-mail de destino e mensagens de sucesso/erro:** Contato → Formulários de contato → clique no formulário. As abas **Formulário**, **E-mail** e **Mensagens** são do próprio plugin.
- **Ver as mensagens recebidas:** menu do plugin **Contact Form 7 Database** (CFDB7), no painel lateral.
- **Trocar de formulário:** cada formulário tem um número (ID), que aparece no shortcode, ex.: `[contact-form-7 id="22"]`. Para o orçamento, informe o número no campo **ID do formulário** da Home; para os botões do topo, nas **Opções do Tema** (seção 7).

## 7. Opções do Tema (topo e rodapé)

Em **UpWork → Opções do Tema** ficam os itens que aparecem em todo o site. Clique em **Salvar opções** no fim da tela.

| Campo | Onde aparece |
| --- | --- |
| Logo | Topo do site (SVG ou PNG com fundo transparente) |
| Nome do Site | Texto alternativo do logo |
| Header — Botão 1 (texto) | Texto do botão "Manda Portfólio" |
| Header — ID do formulário #mandaportifa | Formulário que o Botão 1 abre |
| Header — Botão 2 (texto) | Texto do botão "Manda Jobs" |
| Header — ID do formulário #mandajobs | Formulário que o Botão 2 abre |
| Footer — Título | Título grande do rodapé rosa (ex.: "contato") |
| Footer — E-mail 1 e E-mail 2 | E-mails clicáveis do rodapé |
| Footer — Telefone | Telefone clicável do rodapé (ex.: +55 11 98250 5116) |
| Footer — Cidade | Linha abaixo do telefone |
| Footer — Texto de direitos autorais | Última linha do rodapé (ex.: © 2026 Geeteê Filmes. Todos os direitos reservados) |

Campos em branco usam o texto original do layout. Os campos **Header — Botão (link)** e **Cor Primária** não têm efeito no layout atual.

**O menu do topo** (ícone de três linhas) leva às seções da Home: Nosso portfólio, Nossos amigos, Conheça nossa equipe, Contato e Solicite um orçamento. Esses links são fixos; mudar os itens em Aparência → Menus **não** altera o menu do site.

## 8. Idiomas

Os idiomas são gerenciados pelo **TranslatePress** (Configurações → TranslatePress).

- A bandeira ao lado do menu aparece quando há **2 ou mais idiomas** publicados. Clicando, o visitante escolhe o idioma e a página recarrega traduzida.
- Para traduzir textos, use o botão **Traduzir página** na barra preta do topo (logado no painel, com o site aberto).
- Depois de editar um texto na Home ou em um projeto, confira a versão traduzida: o texto novo precisa ser traduzido também.

## 9. Problemas comuns

| O que acontece | Causa provável | O que fazer |
| --- | --- | --- |
| Mudei e o site não mudou | Página não salva, ou navegador mostrando a versão antiga | Confira se clicou em **Atualizar**. Recarregue com **Ctrl + F5** (no Mac, Cmd + Shift + R) |
| Categoria nova não aparece | As categorias ficam guardadas por até 5 minutos | Aguarde alguns minutos, ou salve qualquer projeto para forçar a atualização |
| Projeto não aparece no portfólio | Sem categoria, em rascunho, ou na categoria errada | Confira a categoria marcada e se o projeto está **Publicado** |
| Card do projeto cinza | Projeto sem **Imagem destacada** | Defina a imagem destacada no painel da direita |
| Bloco de vídeo cinza na janela do projeto | Bloco sem **Capa** | Envie uma imagem no campo Capa do bloco |
| Vídeo não toca na janela do projeto | Link não é do YouTube, do Vimeo nem de um arquivo .mp4 | Cole o link direto do vídeo (ex.: https://vimeo.com/123456789) |
| Vídeo do hero não aparece | Tipo de mídia não selecionado, ou link do YouTube incompleto | Em "Mídia de fundo", escolha o tipo e cole o link completo do vídeo |
| Projetos de exemplo voltaram | Todos os projetos foram apagados | Cadastre os projetos reais primeiro e só então remova os de exemplo |
| Formulário não aparece | ID do formulário errado ou formulário apagado | Confira o número em Contato → Formulários e atualize o campo de ID |
| Imagem cortada | A imagem preenche um espaço de proporção fixa e corta as bordas | Envie imagens na mesma proporção da anterior, com o assunto no centro |
| Site lento para carregar | Fotos ou vídeos muito pesados | Fotos com no máximo 2000 px de largura (JPG ou WebP); vídeo MP4 com até ~15 MB |

Se algo não se resolver por aqui, anote a seção, o projeto e o que foi alterado e envie ao desenvolvedor.
