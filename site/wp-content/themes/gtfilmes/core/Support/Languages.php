<?php
declare(strict_types=1);

namespace Core\Support;

/**
 * Lê os idiomas publicados no TranslatePress para o seletor de idiomas da SPA.
 * Retorna [] quando o plugin não está ativo.
 */
class Languages
{
    /** @return array<int, array{code: string, slug: string, label: string, baseUrl: string, flagUrl: string, current: bool}> */
    public static function boot(): array
    {
        if (!class_exists('TRP_Translate_Press')) return [];

        $settings = get_option('trp_settings', []);
        $default  = $settings['default-language'] ?? '';
        $publish  = $settings['publish-languages'] ?? [];
        $slugs    = $settings['url-slugs'] ?? [];
        $subdir   = ($settings['add-subdirectory-to-default-language'] ?? 'no') === 'yes';

        global $TRP_LANGUAGE;
        $current = is_string($TRP_LANGUAGE) && $TRP_LANGUAGE !== '' ? $TRP_LANGUAGE : $default;

        // home sem o filtro do TranslatePress (que acrescenta o slug do idioma atual)
        $home = rtrim((string) get_option('home'), '/');

        $languages = [];
        foreach ($publish as $code) {
            $slug    = (string) ($slugs[$code] ?? strtolower(substr($code, 0, 2)));
            $prefix  = ($code === $default && !$subdir) ? '' : '/' . $slug;

            $languages[] = [
                'code'    => $code,
                'slug'    => $slug,
                'label'   => strtoupper($slug),
                'baseUrl' => $home . $prefix,
                'flagUrl' => TRP_PLUGIN_URL . 'assets/flags/1x1/' . $code . '.svg',
                'current' => $code === $current,
            ];
        }

        return $languages;
    }
}
