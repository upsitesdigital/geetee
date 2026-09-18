<?php
declare(strict_types=1);

namespace Core\Admin;

class ThemeOptions
{
    const OPTION_KEY = 'upwork_theme_options';

    public static function register(): void
    {
        add_action('admin_menu',  [self::class, 'addMenu']);
        add_action('admin_init',  [self::class, 'registerSettings']);
        add_action('admin_enqueue_scripts', [self::class, 'enqueueMedia']);
    }

    public static function addMenu(): void
    {
        add_submenu_page(
            parent_slug: 'upwork',
            page_title:  'Opções do Tema',
            menu_title:  'Opções do Tema',
            capability:  'manage_options',
            menu_slug:   'upwork-theme-options',
            callback:    [self::class, 'render'],
        );
    }

    public static function registerSettings(): void
    {
        register_setting('upwork_theme_options_group', self::OPTION_KEY, [
            'sanitize_callback' => [self::class, 'sanitize'],
        ]);
    }

    public static function enqueueMedia(string $hook): void
    {
        if ($hook !== 'upwork_page_upwork-theme-options') return;
        wp_enqueue_media();
    }

    public static function sanitize(mixed $input): array
    {
        if (!is_array($input)) return [];

        return [
            'site_name'          => sanitize_text_field($input['site_name'] ?? ''),
            'logo_url'           => esc_url_raw($input['logo_url'] ?? ''),
            'logo_id'            => absint($input['logo_id'] ?? 0),
            'primary_color'      => sanitize_hex_color($input['primary_color'] ?? ''),
            'footer_text'        => wp_kses_post($input['footer_text'] ?? ''),
            'header_cta_1_text'  => sanitize_text_field($input['header_cta_1_text'] ?? ''),
            'header_cta_1_url'   => esc_url_raw($input['header_cta_1_url'] ?? ''),
            'header_cta_2_text'  => sanitize_text_field($input['header_cta_2_text'] ?? ''),
            'header_cta_2_url'   => esc_url_raw($input['header_cta_2_url'] ?? ''),
            'header_jobs_form_id' => absint($input['header_jobs_form_id'] ?? 0),
            'header_portfolio_form_id' => absint($input['header_portfolio_form_id'] ?? 0),
            'footer_titulo'      => sanitize_text_field($input['footer_titulo'] ?? ''),
            'footer_email_1'     => sanitize_email($input['footer_email_1'] ?? ''),
            'footer_email_2'     => sanitize_email($input['footer_email_2'] ?? ''),
            'footer_telefone'    => sanitize_text_field($input['footer_telefone'] ?? ''),
            'footer_cidade'      => sanitize_text_field($input['footer_cidade'] ?? ''),
        ];
    }

    public static function render(): void
    {
        if (!current_user_can('manage_options')) return;

        $opts = get_option(self::OPTION_KEY, []);
        $siteName    = $opts['site_name']     ?? '';
        $logoUrl     = $opts['logo_url']      ?? '';
        $logoId      = $opts['logo_id']       ?? 0;
        $primaryColor = $opts['primary_color'] ?? '#000000';
        $footerText  = $opts['footer_text']   ?? '';
        $cta1Text    = $opts['header_cta_1_text'] ?? 'Manda Portfólio';
        $cta1Url     = $opts['header_cta_1_url']  ?? '';
        $cta2Text    = $opts['header_cta_2_text'] ?? 'Manda Jobs';
        $cta2Url     = $opts['header_cta_2_url']  ?? '';
        $jobsFormId  = $opts['header_jobs_form_id'] ?? 32;
        $portfolioFormId = $opts['header_portfolio_form_id'] ?? 33;
        $footerTitulo   = $opts['footer_titulo']   ?? 'contato';
        $footerEmail1   = $opts['footer_email_1']  ?? 'marco@gtfilmes.com';
        $footerEmail2   = $opts['footer_email_2']  ?? 'bel@gtfilmes.com';
        $footerTelefone = $opts['footer_telefone'] ?? '+55 11 98250 5116';
        $footerCidade   = $opts['footer_cidade']   ?? 'São Paulo/SP';
        ?>
        <div class="wrap">
            <h1>Opções do Tema</h1>
            <form method="post" action="options.php">
                <?php settings_fields('upwork_theme_options_group'); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="site_name">Nome do Site</label></th>
                        <td>
                            <input
                                type="text"
                                id="site_name"
                                name="<?= self::OPTION_KEY ?>[site_name]"
                                value="<?= esc_attr($siteName) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label>Logo</label></th>
                        <td>
                            <div id="logo-preview" style="margin-bottom:8px">
                                <?php if ($logoUrl): ?>
                                    <img src="<?= esc_url($logoUrl) ?>" style="max-height:80px;display:block">
                                <?php endif; ?>
                            </div>
                            <input type="hidden" id="logo_url" name="<?= self::OPTION_KEY ?>[logo_url]" value="<?= esc_attr($logoUrl) ?>">
                            <input type="hidden" id="logo_id"  name="<?= self::OPTION_KEY ?>[logo_id]"  value="<?= esc_attr((string)$logoId) ?>">
                            <button type="button" class="button" id="btn-logo-select">Selecionar imagem</button>
                            <?php if ($logoUrl): ?>
                                <button type="button" class="button" id="btn-logo-remove">Remover</button>
                            <?php endif; ?>
                            <script>
                            (function(){
                                var frame;
                                document.getElementById('btn-logo-select').addEventListener('click', function(){
                                    if (frame) { frame.open(); return; }
                                    frame = wp.media({ title: 'Selecionar Logo', button: { text: 'Usar como logo' }, multiple: false });
                                    frame.on('select', function(){
                                        var att = frame.state().get('selection').first().toJSON();
                                        document.getElementById('logo_url').value = att.url;
                                        document.getElementById('logo_id').value  = att.id;
                                        var preview = document.getElementById('logo-preview');
                                        preview.innerHTML = '<img src="' + att.url + '" style="max-height:80px;display:block">';
                                    });
                                    frame.open();
                                });
                                var btnRemove = document.getElementById('btn-logo-remove');
                                if (btnRemove) btnRemove.addEventListener('click', function(){
                                    document.getElementById('logo_url').value = '';
                                    document.getElementById('logo_id').value  = '0';
                                    document.getElementById('logo-preview').innerHTML = '';
                                });
                            })();
                            </script>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="primary_color">Cor Primária</label></th>
                        <td>
                            <input
                                type="color"
                                id="primary_color"
                                name="<?= self::OPTION_KEY ?>[primary_color]"
                                value="<?= esc_attr($primaryColor) ?>"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="footer_titulo">Footer — Título</label></th>
                        <td>
                            <input
                                type="text"
                                id="footer_titulo"
                                name="<?= self::OPTION_KEY ?>[footer_titulo]"
                                value="<?= esc_attr($footerTitulo) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="footer_email_1">Footer — E-mail 1</label></th>
                        <td>
                            <input
                                type="email"
                                id="footer_email_1"
                                name="<?= self::OPTION_KEY ?>[footer_email_1]"
                                value="<?= esc_attr($footerEmail1) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="footer_email_2">Footer — E-mail 2</label></th>
                        <td>
                            <input
                                type="email"
                                id="footer_email_2"
                                name="<?= self::OPTION_KEY ?>[footer_email_2]"
                                value="<?= esc_attr($footerEmail2) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="footer_telefone">Footer — Telefone</label></th>
                        <td>
                            <input
                                type="text"
                                id="footer_telefone"
                                name="<?= self::OPTION_KEY ?>[footer_telefone]"
                                value="<?= esc_attr($footerTelefone) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="footer_cidade">Footer — Cidade</label></th>
                        <td>
                            <input
                                type="text"
                                id="footer_cidade"
                                name="<?= self::OPTION_KEY ?>[footer_cidade]"
                                value="<?= esc_attr($footerCidade) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="footer_text">Footer — Texto de direitos autorais</label></th>
                        <td>
                            <textarea
                                id="footer_text"
                                name="<?= self::OPTION_KEY ?>[footer_text]"
                                class="large-text"
                                rows="3"
                            ><?= esc_textarea($footerText) ?></textarea>
                            <p class="description">Aceita HTML básico. Ex: &copy; 2026 Geetê Filmes. Todos os direitos reservados.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="header_cta_1_text">Header — Botão 1 (texto)</label></th>
                        <td>
                            <input
                                type="text"
                                id="header_cta_1_text"
                                name="<?= self::OPTION_KEY ?>[header_cta_1_text]"
                                value="<?= esc_attr($cta1Text) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="header_cta_1_url">Header — Botão 1 (link)</label></th>
                        <td>
                            <input
                                type="url"
                                id="header_cta_1_url"
                                name="<?= self::OPTION_KEY ?>[header_cta_1_url]"
                                value="<?= esc_attr($cta1Url) ?>"
                                class="regular-text"
                                placeholder="https://"
                            >
                            <p class="description">Não usado atualmente — o botão "Manda Portfólio" abre o formulário #mandaportifa em vez de navegar para um link.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="header_portfolio_form_id">Header — ID do formulário #mandaportifa (Contact Form 7)</label></th>
                        <td>
                            <input
                                type="number"
                                id="header_portfolio_form_id"
                                name="<?= self::OPTION_KEY ?>[header_portfolio_form_id]"
                                value="<?= esc_attr((string) $portfolioFormId) ?>"
                                class="small-text"
                            >
                            <p class="description">ID do formulário CF7 "#mandaportifa" (Contato > Formulários de contato no admin).</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="header_cta_2_text">Header — Botão 2 (texto)</label></th>
                        <td>
                            <input
                                type="text"
                                id="header_cta_2_text"
                                name="<?= self::OPTION_KEY ?>[header_cta_2_text]"
                                value="<?= esc_attr($cta2Text) ?>"
                                class="regular-text"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="header_cta_2_url">Header — Botão 2 (link)</label></th>
                        <td>
                            <input
                                type="url"
                                id="header_cta_2_url"
                                name="<?= self::OPTION_KEY ?>[header_cta_2_url]"
                                value="<?= esc_attr($cta2Url) ?>"
                                class="regular-text"
                                placeholder="https://"
                            >
                            <p class="description">Não usado atualmente — o botão "Manda Jobs" abre o formulário #mandajobs em vez de navegar para um link.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="header_jobs_form_id">Header — ID do formulário #mandajobs (Contact Form 7)</label></th>
                        <td>
                            <input
                                type="number"
                                id="header_jobs_form_id"
                                name="<?= self::OPTION_KEY ?>[header_jobs_form_id]"
                                value="<?= esc_attr((string) $jobsFormId) ?>"
                                class="small-text"
                            >
                            <p class="description">ID do formulário CF7 "#mandajobs" (Contato > Formulários de contato no admin).</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Salvar opções'); ?>
            </form>
        </div>
        <?php
    }
}
