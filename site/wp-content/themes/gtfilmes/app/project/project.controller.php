<?php
declare(strict_types=1);

namespace App\Project;

use Core\Framework\Controller;
use Core\Framework\Attributes\Get;
use Core\Framework\Attributes\Cache;

final class ProjectController extends Controller
{
    #[Get('/project/categories')]
    #[Cache(ttl: 300)]
    public function categories(\WP_REST_Request $request): array
    {
        $terms = get_terms([
            'taxonomy'   => 'categories',
            'hide_empty' => false,
            'orderby'    => 'term_id',
            'order'      => 'ASC',
        ]);

        if (is_wp_error($terms) || !is_array($terms)) return [];

        return array_map(static fn(\WP_Term $term) => [
            'id'    => $term->term_id,
            'name'  => $term->name,
            'slug'  => $term->slug,
            'count' => $term->count,
        ], $terms);
    }

    #[Get('/project/list')]
    #[Get('/project/list/:category')]
    #[Cache(ttl: 300)]
    public function list(\WP_REST_Request $request): array
    {
        $categorySlug = (string) ($request->get_param('category') ?: '');
        $page         = max(1, (int) ($request->get_param('page') ?: 1));
        $perPage      = 8;

        $args = [
            'post_type'      => 'project',
            'post_status'    => 'publish',
            'posts_per_page' => $perPage,
            'paged'          => $page,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ];

        if ($categorySlug !== '') {
            $args['tax_query'] = [[
                'taxonomy' => 'categories',
                'field'    => 'slug',
                'terms'    => $categorySlug,
            ]];
        }

        $query = new \WP_Query($args);

        $items = array_map(function (\WP_Post $post): array {
            $thumbId = get_post_thumbnail_id($post);

            return [
                'id'        => $post->ID,
                'titulo'    => get_the_title($post),
                'subtitulo' => (string) ($this->field($post->ID, 'subtitulo') ?? ''),
                'logo'      => $this->image($this->field($post->ID, 'logo')),
                'imagem'    => $thumbId ? [
                    'src' => (string) wp_get_attachment_image_url($thumbId, 'large'),
                    'alt' => (string) get_post_meta($thumbId, '_wp_attachment_image_alt', true),
                ] : null,
            ];
        }, $query->posts);

        return [
            'items'   => $items,
            'hasMore' => $page < $query->max_num_pages,
        ];
    }

    #[Get('/project/:id')]
    #[Cache(ttl: 300)]
    public function show(\WP_REST_Request $request): array
    {
        $postId = (int) $request->get_param('id');
        if (!$postId || get_post_type($postId) !== 'project') return [];

        $rows   = $this->field($postId, 'conteudo') ?: [];
        $blocos = [];

        foreach ($rows as $row) {
            $tipo = $row['acf_fc_layout'] ?? '';

            if ($tipo === 'texto') {
                $blocos[] = [
                    'tipo'  => 'texto',
                    'texto' => (string) ($row['texto'] ?? ''),
                ];
                continue;
            }

            if ($tipo === 'video') {
                $blocos[] = [
                    'tipo'      => 'video',
                    'videoUrl'  => (string) ($row['video_url'] ?? ''),
                    'thumbnail' => $this->image($row['thumbnail'] ?? null),
                ];
                continue;
            }

            if ($tipo === 'imagens') {
                $imagens = is_array($row['imagens'] ?? null) ? $row['imagens'] : [];
                $blocos[] = [
                    'tipo'    => 'imagens',
                    'imagens' => array_values(array_filter(array_map(
                        fn($img) => $this->image($img),
                        $imagens
                    ))),
                ];
            }
        }

        return [
            'id'                => $postId,
            'titulo'            => get_the_title($postId),
            'subtitulo'         => (string) ($this->field($postId, 'subtitulo') ?? ''),
            'logo'              => $this->image($this->field($postId, 'logo')),
            'descricaoCompleta' => (string) ($this->field($postId, 'descricao_completa') ?? ''),
            'blocos'            => $blocos,
        ];
    }
}
