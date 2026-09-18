<?php
declare(strict_types=1);

namespace App\Home;

use Core\Framework\Controller;
use Core\Framework\Attributes\Get;
use Core\Framework\Attributes\Cache;

final class HomeController extends Controller
{
    #[Get('/forms/cf7/:id')]
    public function cf7Form(\WP_REST_Request $request): array
    {
        $id = (int) $request->get_param('id');

        if ($id <= 0 || !function_exists('wpcf7_contact_form')) {
            return ['html' => ''];
        }

        $contactForm = wpcf7_contact_form($id);

        if (!$contactForm) {
            return ['html' => ''];
        }

        return ['html' => $contactForm->form_html()];
    }

    #[Get('/home')]
    #[Get('/home/:id')]
    #[Cache(ttl: 300)]
    public function index(\WP_REST_Request $request): array
    {
        $pageId = (int) ($request->get_param('id') ?: get_option('page_on_front') ?: 0);

        $textura = $this->image($this->field($pageId, 'hero_titulo_textura')) ?? [
            'src'    => get_template_directory_uri() . '/app/home/assets/hero-demo-reel-texture.png',
            'alt'    => '',
            'width'  => null,
            'height' => null,
            'sizes'  => [],
        ];

        $amigosLogos = [];
        if (function_exists('have_rows')) {
            while (have_rows('amigos_logos', $pageId)) {
                the_row();
                $logo = $this->image(get_sub_field('logo'));
                if ($logo === null) {
                    continue;
                }
                $amigosLogos[] = [
                    'imagem' => $logo,
                    'nome'   => (string) (get_sub_field('nome') ?? ''),
                ];
            }
        }

        $amigosBadge = $this->image($this->field($pageId, 'amigos_badge')) ?? [
            'src'    => get_template_directory_uri() . '/resources/assets/header/badge.svg',
            'alt'    => '',
            'width'  => null,
            'height' => null,
            'sizes'  => [],
        ];

        $redes = [];
        if (function_exists('have_rows')) {
            while (have_rows('fale_redes', $pageId)) {
                the_row();
                $redes[] = [
                    'nome' => (string) (get_sub_field('nome') ?? ''),
                    'url'  => (string) (get_sub_field('url') ?? ''),
                ];
            }
        }
        if (empty($redes)) {
            $redes = [
                ['nome' => 'instagram', 'url' => ''],
                ['nome' => 'facebook', 'url' => ''],
                ['nome' => 'youtube', 'url' => ''],
                ['nome' => 'linkedin', 'url' => ''],
            ];
        }

        $statsItens = [];
        if (function_exists('have_rows')) {
            while (have_rows('stats_itens', $pageId)) {
                the_row();
                $statsItens[] = [
                    'numero'    => (string) (get_sub_field('numero') ?? ''),
                    'descricao' => (string) (get_sub_field('descricao') ?? ''),
                ];
            }
        }
        if (empty($statsItens)) {
            $statsItens = [
                [
                    'numero'    => '+4000',
                    'descricao' => 'São mais de 4000 projetos desenvolvidos que vão desde criação de roteiros e peças de design até campanhas de comunicação interna e comerciais publicitários.',
                ],
                [
                    'numero'    => '+100',
                    'descricao' => 'Conquistamos a marca de mais de 100 clientes atendidos dentro e fora do Brasil.',
                ],
                [
                    'numero'    => '+10',
                    'descricao' => 'E nossa estrada conta com mais de 10 anos de atuação no audiovisual brasileiro.',
                ],
            ];
        }

        $statsImagemMobile = $this->image($this->field($pageId, 'stats_imagem_mobile')) ?? [
            'src'    => get_template_directory_uri() . '/app/home/assets/stats-bg-mobile.png',
            'alt'    => '',
            'width'  => null,
            'height' => null,
            'sizes'  => [],
        ];

        $membros = [];
        if (function_exists('have_rows')) {
            while (have_rows('time_membros', $pageId)) {
                the_row();
                $membros[] = [
                    'foto'  => $this->image(get_sub_field('foto')),
                    'nome'  => (string) (get_sub_field('nome') ?? ''),
                    'cargo' => (string) (get_sub_field('cargo') ?? ''),
                    'bio'   => (string) (get_sub_field('bio') ?? ''),
                ];
            }
        }
        if (empty($membros)) {
            $membros = [
                [
                    'foto'  => null,
                    'nome'  => 'Marco Falkembach',
                    'cargo' => 'Diretor de Criação',
                    'bio'   => 'Olá ;) Sou diretor de criação e produção aqui na Geeteê Filmes. Trabalho há mais de 10 anos com comunicação e contribuo para que marcas transformem ideias em histórias com intenção, cuidado e sensibilidade, sempre a partir da escuta e de um olhar humano e criativo.',
                ],
                [
                    'foto'  => null,
                    'nome'  => 'Pedro Lanfranchi',
                    'cargo' => 'Motion Designer',
                    'bio'   => 'Sou motion designer 2D e 3D aqui na Geeteê Filmes. Nesses mais de 15 anos de experiência na área de comunicação, desenvolvi um olhar apurado para transformar ideias em experiências visuais que aproximam, encantam e fazem sentido.',
                ],
                [
                    'foto'  => null,
                    'nome'  => 'Gustavo Rosseb',
                    'cargo' => 'Roteirista',
                    'bio'   => 'Roteirista aqui na Geeteê, artista, escritor, cantor e compositor no mundo. Te ajudo a encontrar os melhores caminhos para que juntos contemos as histórias mais emocionantes.',
                ],
            ];
        }

        return [
            'hero' => [
                'tituloLinha1' => (string) ($this->field($pageId, 'hero_titulo_linha1') ?? 'Demo'),
                'tituloLinha2' => (string) ($this->field($pageId, 'hero_titulo_linha2') ?? 'Reel'),
                'tituloTextura' => $textura,
                'descricao'    => (string) ($this->field($pageId, 'hero_descricao') ?? ''),
            ],
            'amigos' => [
                'badge'        => $amigosBadge,
                'tituloLinha1' => (string) ($this->field($pageId, 'amigos_titulo_linha1') ?? 'nossos'),
                'tituloLinha2' => (string) ($this->field($pageId, 'amigos_titulo_linha2') ?? 'amigos'),
                'descricao'    => (string) ($this->field($pageId, 'amigos_descricao') ?? ''),
                'logos'        => $amigosLogos,
            ],
            'orcamento' => [
                'tituloLinha1' => (string) ($this->field($pageId, 'orcamento_titulo_linha1') ?? 'solicite um'),
                'tituloLinha2' => (string) ($this->field($pageId, 'orcamento_titulo_linha2') ?? 'orçamento'),
                'subtitulo'    => (string) ($this->field($pageId, 'orcamento_subtitulo') ?? ''),
                'descricao'    => (string) ($this->field($pageId, 'orcamento_descricao') ?? ''),
                'formId'       => (int) ($this->field($pageId, 'orcamento_form_id') ?: 22),
            ],
            'stats' => [
                'itens'        => $statsItens,
                'imagemMobile' => $statsImagemMobile,
            ],
            'fale' => [
                'tituloLinha1' => (string) ($this->field($pageId, 'fale_titulo_linha1') ?? 'fale com'),
                'tituloLinha2' => (string) ($this->field($pageId, 'fale_titulo_linha2') ?? 'a gente'),
                'redes'     => $redes,
                'timeTexto' => (string) ($this->field($pageId, 'fale_time_texto') ?? 'Conheça um pouco do nosso time.'),
                'timeUrl'   => (string) ($this->field($pageId, 'fale_time_url') ?? ''),
            ],
            'time' => [
                'membros' => $membros,
            ],
        ];
    }
}
