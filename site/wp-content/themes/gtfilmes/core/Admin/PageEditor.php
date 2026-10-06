<?php
declare(strict_types=1);

namespace Core\Admin;

/**
 * Esconde o editor de conteúdo (classic editor) nas Pages que usam um template
 * diferente do "Modelo por omissão". O conteúdo continua salvo; só a UI some.
 * Alterna em tempo real quando o template é trocado no dropdown.
 */
class PageEditor
{
    public static function register(): void
    {
        add_filter('admin_body_class', [self::class, 'bodyClass']);
        add_action('admin_head-post.php',       [self::class, 'printStyles']);
        add_action('admin_head-post-new.php',   [self::class, 'printStyles']);
        add_action('admin_footer-post.php',     [self::class, 'printScript']);
        add_action('admin_footer-post-new.php', [self::class, 'printScript']);
    }

    public static function bodyClass(string $classes): string
    {
        global $post;
        if (!self::isPageScreen() || !$post instanceof \WP_Post) return $classes;

        $template = get_post_meta($post->ID, '_wp_page_template', true);
        return self::isDefault((string) $template) ? $classes : $classes . ' fw-no-editor';
    }

    public static function printStyles(): void
    {
        if (!self::isPageScreen()) return;
        echo "<style>.fw-no-editor #postdivrich{display:none}</style>\n";
    }

    public static function printScript(): void
    {
        if (!self::isPageScreen()) return;
        ?>
        <script>
        (function () {
            var select = document.getElementById('page_template');
            if (!select) return;
            select.addEventListener('change', function () {
                var hide = select.value !== '' && select.value !== 'default';
                document.body.classList.toggle('fw-no-editor', hide);
                if (!hide) window.dispatchEvent(new Event('resize'));
            });
        })();
        </script>
        <?php
    }

    private static function isDefault(string $template): bool
    {
        return $template === '' || $template === 'default';
    }

    private static function isPageScreen(): bool
    {
        $screen = function_exists('get_current_screen') ? get_current_screen() : null;
        return $screen !== null && $screen->base === 'post' && $screen->post_type === 'page';
    }
}
