export interface FwBoot {
  apiBase: string
  wpApiBase: string
  siteUrl: string
  themeUrl: string
  nonce: string  // mutável — renovado por api.ts ao receber 401
  themeOptions: Record<string, unknown>
  currentPath: string
  currentRoute: {
    module: string
    pageId: number | null
    url: string
    title: string
  } | null
  /** Idiomas publicados no TranslatePress (vazio se o plugin estiver inativo). */
  languages?: Array<{
    code: string
    slug: string
    label: string
    baseUrl: string
    flagUrl: string
    current: boolean
  }>
}

declare global {
  interface Window {
    FW_BOOT: FwBoot
  }
}

export const boot: FwBoot = window.FW_BOOT

/**
 * Caminho base do site (ex: '/projetos/gtfilmes/site' quando instalado em subdiretório, '/' na raiz).
 * Usado pelo router (basename) e por useCurrentRoute para normalizar comparações de path.
 */
export const basename = new URL(boot.siteUrl).pathname.replace(/\/$/, '') || '/'
