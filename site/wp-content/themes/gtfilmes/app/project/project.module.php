<?php
declare(strict_types=1);

namespace App\Project;

use Core\Framework\Module;
use Core\Framework\Attributes\Module as Mod;
use Core\Framework\Attributes\Required;
use Core\Framework\Attributes\PostType;
use Core\Framework\Attributes\Taxonomy;

#[Mod(
    slug: 'project',
    name: 'Projetos',
    icon: 'portfolio',
    menuPosition: 25,
)]
#[Required]
#[PostType(
    slug: 'project',
    singular: 'Projeto',
    plural: 'Projetos',
    icon: 'dashicons-portfolio',
    supports: ['title', 'editor', 'thumbnail'],
)]
#[Taxonomy(
    slug: 'categories',
    plural: 'Categorias',
    postType: 'project',
    hierarchical: true,
    showInRest: false,
)]
final class ProjectModule extends Module
{
    /** Termos padrão — espelham o bloco de categorias do Figma (home, 2º bloco). */
    private const DEFAULT_CATEGORIES = [
        'Rec Brand',
        'Rec Nature',
        'Motion 2D',
        '3D',
        'Design',
        'Illustration',
        'Photography',
        'Sound Design',
    ];

    /** Projetos de exemplo — espelham o grid do Figma (home, 3º bloco, categoria "Rec Brand"). */
    private const DEMO_PROJECTS = [
        'demo-01-familia-carro.png',
        'demo-02-set-filmagem.png',
        'demo-03-logo-vidro.png',
        'demo-04-cachoeira.png',
        'demo-05-bastidores-pb.png',
        'demo-06-capacete-voith.png',
        'demo-07-claymation-praia.png',
        'demo-08-depoimento.png',
    ];

    private const DEMO_TITULO    = 'Nome do projeto de Rec Brand';
    private const DEMO_SUBTITULO = 'Lorem ipsum dolor sit amet consectetur. Fermentum tellus morbi interdum.';
    private const DEMO_DESCRICAO_COMPLETA = 'Lorem ipsum dolor sit amet consectetur. Fermentum tellus morbi interdum turpis feugiat. A in lobortis integer tincidunt accumsan quam. Lorem ipsum dolor sit amet consectetur. Fermentum tellus morbi interdum turpis feugiat. A in lobortis integer tincidunt accumsan quam.';
    private const DEMO_BLOCO_TEXTO = 'Lorem ipsum dolor sit amet consectetur. Fermentum tellus morbi interdum turpis feugiat. A in lobortis integer tincidunt accumsan quam.';

    public function fields(): void
    {
        acf_add_local_field_group([
            'key'      => 'group_project',
            'title'    => 'Projeto — Campos',
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'project']]],
            'fields'   => [
                [
                    'key'           => 'field_project_subtitulo',
                    'name'          => 'subtitulo',
                    'label'         => 'Subtítulo / Descrição curta',
                    'type'          => 'textarea',
                    'rows'          => 2,
                    'default_value' => self::DEMO_SUBTITULO,
                ],
                [
                    'key'           => 'field_project_logo',
                    'name'          => 'logo',
                    'label'         => 'Logo do cliente (círculo)',
                    'instructions'  => 'Exibido como emblema circular sobre o nome do projeto. Se vazio, mostra um círculo branco.',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'preview_size'  => 'thumbnail',
                ],
                [
                    'key'           => 'field_project_descricao_completa',
                    'name'          => 'descricao_completa',
                    'label'         => 'Descrição completa (popup do projeto)',
                    'instructions'  => 'Texto de introdução exibido no topo do popup, ao lado do título.',
                    'type'          => 'textarea',
                    'rows'          => 4,
                    'default_value' => self::DEMO_DESCRICAO_COMPLETA,
                ],
                [
                    'key'          => 'field_project_conteudo',
                    'name'         => 'conteudo',
                    'label'        => 'Conteúdo do popup (blocos)',
                    'instructions' => 'Monte o corpo do popup do projeto empilhando blocos de texto, vídeo e imagens, na ordem que quiser.',
                    'type'         => 'flexible_content',
                    'button_label' => 'Adicionar bloco',
                    'layouts'      => [
                        'layout_texto' => [
                            'key'        => 'layout_texto',
                            'name'       => 'texto',
                            'label'      => 'Texto',
                            'display'    => 'block',
                            'sub_fields' => [
                                [
                                    'key'           => 'field_bloco_texto',
                                    'name'          => 'texto',
                                    'label'         => 'Texto',
                                    'type'          => 'wysiwyg',
                                    'media_upload'  => 0,
                                    'toolbar'       => 'basic',
                                    'tabs'          => 'visual',
                                ],
                            ],
                        ],
                        'layout_video' => [
                            'key'        => 'layout_video',
                            'name'       => 'video',
                            'label'      => 'Vídeo',
                            'display'    => 'block',
                            'sub_fields' => [
                                [
                                    'key'          => 'field_bloco_video_url',
                                    'name'         => 'video_url',
                                    'label'        => 'URL do vídeo',
                                    'instructions' => 'Link do YouTube, Vimeo ou de um arquivo .mp4 direto.',
                                    'type'         => 'url',
                                ],
                                [
                                    'key'           => 'field_bloco_video_thumbnail',
                                    'name'          => 'thumbnail',
                                    'label'         => 'Capa (antes de dar play)',
                                    'type'          => 'image',
                                    'return_format' => 'array',
                                    'preview_size'  => 'medium',
                                ],
                            ],
                        ],
                        'layout_imagens' => [
                            'key'        => 'layout_imagens',
                            'name'       => 'imagens',
                            'label'      => 'Imagens',
                            'display'    => 'block',
                            'sub_fields' => [
                                [
                                    'key'           => 'field_bloco_imagens',
                                    'name'          => 'imagens',
                                    'label'         => 'Imagens',
                                    'instructions'  => 'Adicione 1 imagem (largura total), 2 (50%/50%) ou 3 (33%/34%/33%) — o layout é definido automaticamente pela quantidade.',
                                    'type'          => 'gallery',
                                    'return_format' => 'array',
                                    'preview_size'  => 'medium',
                                    'min'           => 1,
                                    'max'           => 3,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);
    }

    public function boot(): void
    {
        $this->seedDefaultCategories();
        $this->seedDemoProjects();
    }

    private function seedDefaultCategories(): void
    {
        if (!taxonomy_exists('categories')) return;

        $existing = get_terms(['taxonomy' => 'categories', 'hide_empty' => false, 'fields' => 'ids']);
        if (!empty($existing)) return;

        foreach (self::DEFAULT_CATEGORIES as $name) {
            wp_insert_term($name, 'categories');
        }
    }

    private function seedDemoProjects(): void
    {
        if (!post_type_exists('project')) return;

        $existing = get_posts([
            'post_type'      => 'project',
            'post_status'    => 'any',
            'numberposts'    => 1,
            'fields'         => 'ids',
        ]);
        if (!empty($existing)) return;

        foreach (self::DEMO_PROJECTS as $filename) {
            $postId = wp_insert_post([
                'post_type'   => 'project',
                'post_title'  => self::DEMO_TITULO,
                'post_status' => 'publish',
            ]);

            if (!$postId || is_wp_error($postId)) continue;

            wp_set_object_terms($postId, ['Rec Brand'], 'categories');

            $imagePath    = get_template_directory() . '/app/project/assets/' . $filename;
            $attachmentId = self::sideloadImage($imagePath, $postId);
            if ($attachmentId) {
                set_post_thumbnail($postId, $attachmentId);
            }

            if (function_exists('update_field')) {
                update_field('subtitulo', self::DEMO_SUBTITULO, $postId);
                update_field('descricao_completa', self::DEMO_DESCRICAO_COMPLETA, $postId);

                $conteudo = [
                    ['acf_fc_layout' => 'texto', 'texto' => self::DEMO_BLOCO_TEXTO],
                ];
                if ($attachmentId) {
                    $conteudo[] = ['acf_fc_layout' => 'imagens', 'imagens' => [$attachmentId]];
                }
                $conteudo[] = ['acf_fc_layout' => 'texto', 'texto' => self::DEMO_BLOCO_TEXTO];

                update_field('conteudo', $conteudo, $postId);
            }
        }
    }

    private static function sideloadImage(string $path, int $postId): ?int
    {
        if (!file_exists($path)) return null;

        $upload = wp_upload_bits(basename($path), null, (string) file_get_contents($path));
        if (!empty($upload['error'])) return null;

        $filetype = wp_check_filetype(basename($path));

        $attachmentId = wp_insert_attachment([
            'post_mime_type' => $filetype['type'],
            'post_title'     => basename($path),
            'post_status'    => 'inherit',
        ], $upload['file'], $postId);

        if (!$attachmentId || is_wp_error($attachmentId)) return null;

        require_once ABSPATH . 'wp-admin/includes/image.php';
        $metadata = wp_generate_attachment_metadata($attachmentId, $upload['file']);
        wp_update_attachment_metadata($attachmentId, $metadata);

        return $attachmentId;
    }
}
