import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { boot, basename } from '@/lib/env'

export type CurrentRoute = {
  module: string
  pageId: number | null
  url: string
  title: string
} | null

/**
 * `pathname` vem do React Router (useLocation), já relativo ao basename da SPA.
 * `routeUrl` vem do PHP (window.FW_BOOT.currentRoute.url), URL absoluta incluindo o basename.
 * Por isso removemos o basename da URL do PHP antes de comparar.
 */
function pathsMatch(routeUrl: string, pathname: string): boolean {
  try {
    let p1 = new URL(routeUrl).pathname
    if (basename !== '/' && p1.startsWith(basename)) {
      p1 = p1.slice(basename.length) || '/'
    }
    p1 = p1.replace(/\/$/, '') || '/'
    const p2 = pathname.replace(/\/$/, '') || '/'
    return p1 === p2
  } catch {
    return false
  }
}

/**
 * Retorna o módulo e pageId correspondentes à rota atual do React Router.
 * Usa boot.currentRoute quando o path já foi resolvido no carregamento inicial,
 * e busca do REST /route?path= na navegação client-side.
 */
export function useCurrentRoute() {
  const { pathname } = useLocation()
  const bootRoute = boot.currentRoute
  const isCached  = bootRoute !== null && pathsMatch(bootRoute.url, pathname)

  return useQuery<CurrentRoute>({
    queryKey:    ['route', pathname],
    queryFn:     () => api<CurrentRoute>(`/route?path=${encodeURIComponent(pathname)}`),
    enabled:     !isCached,
    staleTime:   Infinity,
    initialData: isCached ? bootRoute : undefined,
  })
}
