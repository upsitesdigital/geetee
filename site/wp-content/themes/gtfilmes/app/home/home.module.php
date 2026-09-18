<?php
declare(strict_types=1);

namespace App\Home;

use Core\Framework\Module;
use Core\Framework\Attributes\Module as Mod;
use Core\Framework\Attributes\Required;

#[Mod(
    slug: 'home',
    name: 'Home',
    route: '/',
    template: true,
    templateLabel: 'Página · Home',
)]
#[Required]
final class HomeModule extends Module
{
    public function fields(): void
    {
        $location = [[
            ['param' => 'page_template', 'operator' => '==', 'value' => 'fw:home'],
        ]];

        acf_add_local_field_group([
            'key'        => 'group_home_hero',
            'title'      => 'Home — Hero (Demo Reel)',
            'location'   => $location,
            'menu_order' => 0,
            'fields'     => [
                [
                    'key'           => 'field_home_hero_titulo_linha1',
                    'name'          => 'hero_titulo_linha1',
                    'label'         => 'Título (linha 1)',
                    'type'          => 'text',
                    'required'      => 1,
                    'default_value' => 'Demo',
                ],
                [
                    'key'           => 'field_home_hero_titulo_linha2',
                    'name'          => 'hero_titulo_linha2',
                    'label'         => 'Título (linha 2)',
                    'type'          => 'text',
                    'required'      => 1,
                    'default_value' => 'Reel',
                ],
                [
                    'key'           => 'field_home_hero_titulo_textura',
                    'name'          => 'hero_titulo_textura',
                    'label'         => 'Textura do título',
                    'instructions'  => 'Imagem usada como preenchimento do título gigante do hero.',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'preview_size'  => 'medium',
                ],
                [
                    'key'           => 'field_home_hero_descricao',
                    'name'          => 'hero_descricao',
                    'label'         => 'Descrição',
                    'type'          => 'textarea',
                    'rows'          => 3,
                    'default_value' => 'São mais de 10 anos oferendo aos nossos clientes as melhores soluções do audiovisual brasileiro.',
                ],
            ],
        ]);

        acf_add_local_field_group([
            'key'        => 'group_home_amigos',
            'title'      => 'Home — Nossos Amigos',
            'location'   => $location,
            'menu_order' => 1,
            'fields'     => [
                [
                    'key'           => 'field_home_amigos_badge',
                    'name'          => 'amigos_badge',
                    'label'         => 'Ícone / emblema da marca',
                    'instructions'  => 'Ícone circular exibido acima do título.',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'preview_size'  => 'thumbnail',
                ],
                [
                    'key'           => 'field_home_amigos_titulo_linha1',
                    'name'          => 'amigos_titulo_linha1',
                    'label'         => 'Título (linha 1)',
                    'type'          => 'text',
                    'default_value' => 'nossos',
                ],
                [
                    'key'           => 'field_home_amigos_titulo_linha2',
                    'name'          => 'amigos_titulo_linha2',
                    'label'         => 'Título (linha 2, destaque rosa)',
                    'type'          => 'text',
                    'default_value' => 'amigos',
                ],
                [
                    'key'           => 'field_home_amigos_descricao',
                    'name'          => 'amigos_descricao',
                    'label'         => 'Descrição',
                    'type'          => 'textarea',
                    'rows'          => 4,
                    'default_value' => 'Uma trajetória feita de encontros, parcerias e histórias que nos enchem de orgulho. Ao lado de clientes que acreditam na força das relações humanas, tornamos cada projeto verdadeiramente importante.',
                ],
                [
                    'key'          => 'field_home_amigos_logos',
                    'name'         => 'amigos_logos',
                    'label'        => 'Logos de clientes/parceiros',
                    'instructions' => 'Cadastre cada logo individualmente. São exibidos em um slider.',
                    'type'         => 'repeater',
                    'layout'       => 'table',
                    'min'          => 0,
                    'max'          => 0,
                    'button_label' => 'Adicionar logo',
                    'sub_fields'   => [
                        [
                            'key'           => 'field_home_amigos_logo_imagem',
                            'name'          => 'logo',
                            'label'         => 'Logo',
                            'type'          => 'image',
                            'return_format' => 'array',
                            'preview_size'  => 'thumbnail',
                        ],
                        [
                            'key'   => 'field_home_amigos_logo_nome',
                            'name'  => 'nome',
                            'label' => 'Nome (acessibilidade)',
                            'type'  => 'text',
                        ],
                    ],
                ],
            ],
        ]);

        acf_add_local_field_group([
            'key'        => 'group_home_orcamento',
            'title'      => 'Home — Solicite um Orçamento',
            'location'   => $location,
            'menu_order' => 2,
            'fields'     => [
                [
                    'key'           => 'field_home_orcamento_titulo_linha1',
                    'name'          => 'orcamento_titulo_linha1',
                    'label'         => 'Título (linha 1)',
                    'type'          => 'text',
                    'default_value' => 'solicite um',
                ],
                [
                    'key'           => 'field_home_orcamento_titulo_linha2',
                    'name'          => 'orcamento_titulo_linha2',
                    'label'         => 'Título (linha 2, destaque rosa)',
                    'type'          => 'text',
                    'default_value' => 'orçamento',
                ],
                [
                    'key'           => 'field_home_orcamento_subtitulo',
                    'name'          => 'orcamento_subtitulo',
                    'label'         => 'Subtítulo',
                    'type'          => 'text',
                    'default_value' => 'Aqui você pode ser breve ;)',
                ],
                [
                    'key'           => 'field_home_orcamento_descricao',
                    'name'          => 'orcamento_descricao',
                    'label'         => 'Descrição',
                    'type'          => 'textarea',
                    'rows'          => 4,
                    'default_value' => 'Compartilhe com a gente o que você tem em mente e deixe seus dados de contato. Assim que possível, vamos te convidar para um café, presencial ou online, para entender como podemos ajudar a transformar esse projeto em realidade.',
                ],
                [
                    'key'           => 'field_home_orcamento_form_id',
                    'name'          => 'orcamento_form_id',
                    'label'         => 'ID do formulário (Contact Form 7)',
                    'instructions'  => 'ID do formulário CF7 "Solicitar Orçamento" (Contato > Formulários de contato no admin).',
                    'type'          => 'number',
                    'default_value' => 22,
                ],
            ],
        ]);

        acf_add_local_field_group([
            'key'        => 'group_home_stats',
            'title'      => 'Home — Estatística',
            'location'   => $location,
            'menu_order' => 3,
            'fields'     => [
                [
                    'key'          => 'field_home_stats_itens',
                    'name'         => 'stats_itens',
                    'label'        => 'Itens',
                    'instructions' => 'Cada item alterna automaticamente na seção.',
                    'type'         => 'repeater',
                    'layout'       => 'block',
                    'min'          => 0,
                    'max'          => 0,
                    'button_label' => 'Adicionar item',
                    'sub_fields'   => [
                        [
                            'key'   => 'field_home_stats_item_numero',
                            'name'  => 'numero',
                            'label' => 'Número',
                            'type'  => 'text',
                        ],
                        [
                            'key'   => 'field_home_stats_item_descricao',
                            'name'  => 'descricao',
                            'label' => 'Descrição',
                            'type'  => 'textarea',
                            'rows'  => 3,
                        ],
                    ],
                ],
                [
                    'key'           => 'field_home_stats_imagem_mobile',
                    'name'          => 'stats_imagem_mobile',
                    'label'         => 'Imagem de fundo (mobile)',
                    'instructions'  => 'Imagem exibida no topo da seção apenas em telas de celular. No tablet/desktop a seção usa a imagem de fundo padrão.',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'preview_size'  => 'medium',
                ],
            ],
        ]);

        acf_add_local_field_group([
            'key'        => 'group_home_fale',
            'title'      => 'Home — Fale com a Gente',
            'location'   => $location,
            'menu_order' => 4,
            'fields'     => [
                [
                    'key'           => 'field_home_fale_titulo_linha1',
                    'name'          => 'fale_titulo_linha1',
                    'label'         => 'Título (linha 1)',
                    'type'          => 'text',
                    'default_value' => 'fale com',
                ],
                [
                    'key'           => 'field_home_fale_titulo_linha2',
                    'name'          => 'fale_titulo_linha2',
                    'label'         => 'Título (linha 2, com seta ao lado)',
                    'type'          => 'text',
                    'default_value' => 'a gente',
                ],
                [
                    'key'          => 'field_home_fale_redes',
                    'name'         => 'fale_redes',
                    'label'        => 'Redes sociais',
                    'type'         => 'repeater',
                    'layout'       => 'table',
                    'min'          => 0,
                    'max'          => 0,
                    'button_label' => 'Adicionar rede social',
                    'sub_fields'   => [
                        [
                            'key'   => 'field_home_fale_rede_nome',
                            'name'  => 'nome',
                            'label' => 'Nome',
                            'type'  => 'text',
                        ],
                        [
                            'key'   => 'field_home_fale_rede_url',
                            'name'  => 'url',
                            'label' => 'Link',
                            'type'  => 'url',
                        ],
                    ],
                ],
                [
                    'key'           => 'field_home_fale_time_texto',
                    'name'          => 'fale_time_texto',
                    'label'         => 'Texto do link "time"',
                    'type'          => 'text',
                    'default_value' => 'Conheça um pouco do nosso time.',
                ],
                [
                    'key'   => 'field_home_fale_time_url',
                    'name'  => 'fale_time_url',
                    'label' => 'Link do "time"',
                    'type'  => 'text',
                ],
            ],
        ]);

        acf_add_local_field_group([
            'key'        => 'group_home_time',
            'title'      => 'Home — Time',
            'location'   => $location,
            'menu_order' => 5,
            'fields'     => [
                [
                    'key'          => 'field_home_time_membros',
                    'name'         => 'time_membros',
                    'label'        => 'Membros',
                    'type'         => 'repeater',
                    'layout'       => 'block',
                    'min'          => 0,
                    'max'          => 0,
                    'button_label' => 'Adicionar membro',
                    'sub_fields'   => [
                        [
                            'key'           => 'field_home_time_membro_foto',
                            'name'          => 'foto',
                            'label'         => 'Foto',
                            'type'          => 'image',
                            'return_format' => 'array',
                            'preview_size'  => 'medium',
                        ],
                        [
                            'key'   => 'field_home_time_membro_nome',
                            'name'  => 'nome',
                            'label' => 'Nome',
                            'type'  => 'text',
                        ],
                        [
                            'key'   => 'field_home_time_membro_cargo',
                            'name'  => 'cargo',
                            'label' => 'Cargo',
                            'type'  => 'text',
                        ],
                        [
                            'key'  => 'field_home_time_membro_bio',
                            'name' => 'bio',
                            'label'=> 'Bio',
                            'type' => 'textarea',
                            'rows' => 3,
                        ],
                    ],
                ],
            ],
        ]);
    }
}
