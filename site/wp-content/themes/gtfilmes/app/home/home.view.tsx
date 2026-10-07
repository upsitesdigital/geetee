import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Play, X } from 'lucide-react'
import { useModule } from '@/hooks/useModule'
import { api } from '@/lib/api'
import { boot } from '@/lib/env'
import { cn } from '@/lib/cn'
import arrowAsset from './assets/amigos-arrow.svg'
import statsBgAsset from './assets/stats-bg.jpeg'
import arrowWhiteAsset from './assets/fale-arrow-white.svg'
import faleDividerAsset from './assets/fale-divider.svg'
import faleChevronAsset from './assets/fale-chevron.svg'
import faleWorkAsset from './assets/fale-work.png'
import teamArrowAsset from './assets/team-arrow.svg'
import chevronDownAsset from './assets/chevron-down.svg'
import type { HomeData } from './home.schema'

interface ProjectCategory {
  id: number
  name: string
  slug: string
  count: number
}

interface ProjectImage {
  src: string
  alt: string
}

interface ProjectItem {
  id: number
  titulo: string
  subtitulo: string
  logo: ProjectImage | null
  imagem: ProjectImage | null
}

interface ProjectListPage {
  items: ProjectItem[]
  hasMore: boolean
}

type ProjectBlock =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'video'; videoUrl: string; thumbnail: ProjectImage | null }
  | { tipo: 'imagens'; imagens: ProjectImage[] }

type LightboxMedia =
  | { tipo: 'imagem'; src: string; alt: string }
  | { tipo: 'video'; url: string }

interface ProjectDetail {
  id: number
  titulo: string
  subtitulo: string
  logo: ProjectImage | null
  descricaoCompleta: string
  blocos: ProjectBlock[]
}

function useProjectCategories() {
  return useQuery<ProjectCategory[]>({
    queryKey: ['project-categories'],
    queryFn: () => api<ProjectCategory[]>('/project/categories'),
    staleTime: 1000 * 60 * 5,
  })
}

function useProjectList(categorySlug: string) {
  return useInfiniteQuery({
    queryKey: ['project-list', categorySlug],
    queryFn: ({ pageParam }) => api<ProjectListPage>(`/project/list/${categorySlug}?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    staleTime: 1000 * 60 * 5,
    enabled: categorySlug !== '',
  })
}

function useProjectDetail(id: number | null) {
  return useQuery<ProjectDetail>({
    queryKey: ['project-detail', id],
    queryFn: () => api<ProjectDetail>(`/project/${id}`),
    staleTime: 1000 * 60 * 5,
    enabled: id !== null,
  })
}

function getVideoEmbedUrl(url: string): string | null {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return null
}

export default function HomeView() {
  const { data, isLoading, error } = useModule<HomeData>('home')
  const { data: categories = [] } = useProjectCategories()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  if (isLoading) return <HomeSkeleton />

  if (error || !data) {
    return (
      <p className="container py-16 text-center text-muted-foreground">
        Carregando conteúdo.
      </p>
    )
  }

  const { hero } = data
  const activeCategory = categories.find((c) => c.slug === activeSlug) ?? categories[0] ?? null

  return (
    <div>
      <section className="container px-4 pb-4 sm:px-8 md:pb-6">
        <div className="relative flex flex-col min-h-[auto] sm:min-h-[800px] overflow-hidden rounded-[20px] bg-[#210000] px-6 py-16 sm:px-10 lg:justify-end lg:px-16 xl:px-20">

          <HeroMidia midia={hero.midia} />

          {/* Título + descrição */}
          <div className="relative flex h-full min-h-[630px] sm:min-h-[auto] flex-col-reverse justify-between gap-8 lg:h-auto lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            {(hero.tituloLinha1 || hero.tituloLinha2) && (
              <h1
                className="bg-clip-text text-[18vw] font-black uppercase leading-[0.8] text-transparent bg-cover bg-center sm:text-[16vw] md:text-[13vw] lg:text-[10vw] xl:text-[9vw] 2xl:text-[180px]"
                style={{ backgroundImage: `url("${hero.tituloTextura.src}")` }}
              >
                {hero.tituloLinha1 && <span className="block">{hero.tituloLinha1}</span>}
                {hero.tituloLinha2 && <span className="block">{hero.tituloLinha2}</span>}
              </h1>
            )}

            {hero.descricao && (
              <p className="max-w-[428px] shrink-0 text-lg text-white lg:pt-2 lg:text-2xl">
                {hero.descricao}
              </p>
            )}
          </div>

          {/* Indicador de scroll */}
          <div className="absolute bottom-10 right-6 hidden flex-col items-center gap-2 md:flex lg:right-10 xl:right-20">
            <span className="h-2 w-px bg-white" />
            <span
              className="whitespace-nowrap text-sm uppercase tracking-[3.2px] text-white"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Scroll
            </span>
            <span className="h-4 w-px bg-white" />
          </div>
        </div>
      </section>

      <ProjectCategoryFilters
        categories={categories}
        activeSlug={activeCategory?.slug ?? null}
        onSelect={setActiveSlug}
      />

      {activeCategory && <ProjectGrid category={activeCategory} />}

      <AmigosSection amigos={data.amigos} />

      <OrcamentoSection orcamento={data.orcamento} />

      <StatsSection stats={data.stats} />

      <FaleSection fale={data.fale} />

      <TeamSection time={data.time} />
    </div>
  )
}

function HeroMidia({ midia }: { midia: HomeData['hero']['midia'] }) {
  const { imagem, videoUrl, youtubeId } = midia ?? { imagem: null, videoUrl: null, youtubeId: null }
  if (!imagem && !videoUrl && !youtubeId) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [container-type:size]" aria-hidden="true">
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : youtubeId ? (
        <YouTubeBackground videoId={youtubeId} />
      ) : (
        imagem && (
          <img
            src={imagem.src}
            alt=""
            width={imagem.width ?? undefined}
            height={imagem.height ?? undefined}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )
      )}
      <div className="absolute inset-0 bg-[#210000]/50" />
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type YTWindow = Window & { YT?: any; onYouTubeIframeAPIReady?: () => void }

let youtubeApiPromise: Promise<any> | null = null

const YOUTUBE_REVEAL_DELAY_MS = 3500

function loadYouTubeApi(): Promise<any> {
  const w = window as YTWindow
  if (w.YT?.Player) return Promise.resolve(w.YT)
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previous = w.onYouTubeIframeAPIReady
      w.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve(w.YT)
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.appendChild(script)
    })
  }
  return youtubeApiPromise
}

// Vídeo do YouTube como fundo: sem controles, sem som, em loop. Só aparece quando
// está tocando (esconde a tela de carregamento) e reinicia antes da tela final.
function YouTubeBackground({ videoId }: { videoId: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let player: any = null
    let loopTimer: number | undefined
    let revealTimer: number | undefined
    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return
      player = new YT.Player(mountRef.current, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute()
            e.target.playVideo()
            loopTimer = window.setInterval(() => {
              const duration = player?.getDuration?.() ?? 0
              if (duration > 0 && player.getCurrentTime() > duration - 0.4) {
                player.seekTo(0, true)
              }
            }, 200)
          },
          onStateChange: (e: any) => {
            // O player do YouTube exibe o botão central por alguns segundos ao iniciar;
            // só revela o vídeo depois que ele some.
            if (e.data === YT.PlayerState.PLAYING && !revealTimer) {
              revealTimer = window.setTimeout(() => setPlaying(true), YOUTUBE_REVEAL_DELAY_MS)
            }
            if (e.data === YT.PlayerState.ENDED) {
              e.target.seekTo(0, true)
              e.target.playVideo()
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      window.clearInterval(loopTimer)
      window.clearTimeout(revealTimer)
      player?.destroy?.()
    }
  }, [videoId])

  return (
    <div
      className={cn(
        // Ampliado além do container para cortar as barras do YouTube nas bordas.
        'absolute left-1/2 top-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 scale-[1.35] transition-opacity duration-700 [&_iframe]:h-full [&_iframe]:w-full',
        playing ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div ref={mountRef} />
    </div>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const STATS_ROTATE_INTERVAL_MS = 5000
const STATS_FADE_DURATION_MS = 300

function StatsSection({ stats }: { stats: HomeData['stats'] }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (stats.itens.length <= 1) return

    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % stats.itens.length)
        setVisible(true)
      }, STATS_FADE_DURATION_MS)
    }, STATS_ROTATE_INTERVAL_MS)

    return () => clearInterval(id)
  }, [stats.itens.length])

  const item = stats.itens[index]
  if (!item) return null

  return (
    <section className="relative z-0 flex flex-col overflow-hidden bg-[#EC0076] sm:min-h-[800px]">
      {/* Tablet/desktop: foto de fundo cobrindo a section inteira */}
      <div
        className="absolute inset-0 -z-10 hidden bg-cover bg-center sm:block"
        style={{ backgroundImage: `url("${statsBgAsset}")` }}
      />

      {/* Mobile: imagem cadastrada no topo da seção */}
      <div className="h-[360px] w-full shrink-0 sm:hidden">
        <img
          src={stats.imagemMobile.src}
          alt={stats.imagemMobile.alt}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-h-[300px] flex-1 flex-col justify-center px-4 py-10 sm:min-h-0 sm:px-10 md:px-10 lg:px-16 lg:py-24 xl:px-20">
        <div
          className={cn(
            'flex max-w-[433px] flex-col gap-6 transition-opacity duration-300 lg:gap-10',
            visible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <p className="text-[64px] font-bold leading-none text-white sm:text-7xl lg:text-8xl xl:text-[120px]">
            {item.numero}
          </p>
          {item.descricao && (
            <p className="text-base text-white sm:text-xl lg:text-2xl">{item.descricao}</p>
          )}
        </div>
      </div>
    </section>
  )
}

function FaleSection({ fale }: { fale: HomeData['fale'] }) {
  return (
    <section id="fale" className="scroll-mt-20 flex flex-col-reverse bg-black lg:flex-row">
      <div className="h-auto w-full shrink-0 sm:h-80 md:h-96 lg:h-auto lg:w-[45%]">
        <img src={faleWorkAsset} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-10 px-6 py-16 sm:px-10 md:px-10 lg:justify-center lg:gap-12 lg:px-16 lg:py-20 xl:px-20">
        <h2 className="flex max-w-md flex-col text-4xl font-bold leading-[1.15] text-white sm:text-5xl lg:text-6xl xl:text-[80px]">
          <span className="block">{fale.tituloLinha1}</span>
          <span className="flex items-center gap-3">
            {fale.tituloLinha2}
            <img src={arrowWhiteAsset} alt="" aria-hidden="true" className="h-6 w-auto shrink-0 -rotate-90 lg:h-8 xl:h-10" />
          </span>
        </h2>

        <img src={faleDividerAsset} alt="" aria-hidden="true" className="h-px w-full max-w-[872px]" />

        {fale.redes.length > 0 && (
          <ul className="flex flex-col text-2xl leading-[1.5] text-white sm:text-3xl sm:leading-[1.5] lg:text-4xl lg:leading-[1.5] xl:text-[48px] xl:leading-[1.5]">
            {fale.redes.map((rede, i) => (
              <li key={`${rede.nome}-${i}`}>
                {rede.url ? (
                  <a
                    href={rede.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transition-opacity hover:opacity-70"
                  >
                    {rede.nome}
                  </a>
                ) : (
                  <span>{rede.nome}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {fale.timeTexto && (
          fale.timeUrl ? (
            <a
              href={fale.timeUrl}
              className="flex max-w-md items-center justify-between gap-4 text-xl text-white transition-opacity hover:opacity-80 sm:text-2xl lg:text-[32px]"
            >
              <span>{fale.timeTexto}</span>
              <img src={faleChevronAsset} alt="" aria-hidden="true" className="h-[18px] w-10 shrink-0" />
            </a>
          ) : (
            <div className="flex max-w-md items-center justify-between gap-4 text-xl text-white sm:text-2xl lg:text-[32px]">
              <span>{fale.timeTexto}</span>
              <img src={faleChevronAsset} alt="" aria-hidden="true" className="h-[18px] w-10 shrink-0" />
            </div>
          )
        )}
      </div>
    </section>
  )
}

function TeamSection({ time }: { time: HomeData['time'] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activePage, setActivePage] = useState(0)
  const [scrollerWidth, setScrollerWidth] = useState<number | null>(null)
  const pageCount = time.membros.length

  function cardStep(el: HTMLDivElement) {
    const first = el.children[0] as HTMLElement | undefined
    if (!first) return el.clientWidth
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    return first.getBoundingClientRect().width + gap
  }

  useLayoutEffect(() => {
    const container = containerRef.current
    const el = scrollerRef.current
    if (!container || !el) return

    function measure() {
      if (!container || !el) return

      // Abaixo de lg os cards usam largura parcial (w-[85%]/380px) de propósito,
      // para mostrar uma fresta do próximo card como dica de swipe — não deve
      // ser encaixado sem sobra como no grid de largura fixa do desktop.
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        setScrollerWidth(null)
        return
      }

      const available = container.clientWidth
      const first = el.children[0] as HTMLElement | undefined
      if (available === 0 || !first) return
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      const cardWidth = first.getBoundingClientRect().width
      const step = cardWidth + gap
      if (step === 0) return
      const visibleCount = Math.max(1, Math.floor((available + gap) / step))
      setScrollerWidth(Math.min(available, visibleCount * step - gap))
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [time.membros.length])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    function onScroll() {
      if (!el || el.clientWidth === 0) return
      const step = cardStep(el)
      if (step === 0) return
      setActivePage(Math.round(el.scrollLeft / step))
    }

    el.addEventListener('scroll', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
    }
  }, [time.membros.length])

  function goNext() {
    const el = scrollerRef.current
    if (!el) return
    const step = cardStep(el)
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' })
  }

  function goToPage(index: number) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: index * cardStep(el), behavior: 'smooth' })
  }

  if (time.membros.length === 0) return null

  return (
    <section id="equipe" className="scroll-mt-20 bg-white py-16 lg:py-24 xl:py-[104px]">
      <div className="mx-auto flex max-w-[1760px] items-center gap-6 lg:gap-10">
        <div ref={containerRef} className="min-w-0 flex-1">
          <div
            ref={scrollerRef}
            style={scrollerWidth !== null ? { width: scrollerWidth } : undefined}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2"
          >
            {time.membros.map((membro, i) => (
              <article key={i} className="w-[85%] shrink-0 snap-start px-4 sm:w-[380px] lg:w-[472px]">
                <div className="h-[360px] w-full overflow-hidden rounded-[20px] bg-black sm:h-[440px] lg:h-[522px]">
                  {membro.foto && (
                    <img
                      src={membro.foto.src}
                      alt={membro.foto.alt}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-6 flex flex-col gap-1">
                  <p className="text-2xl font-bold text-black lg:text-[32px]">{membro.nome}</p>
                  <p className="text-lg text-[#670838] lg:text-2xl">{membro.cargo}</p>
                </div>
                {membro.bio && (
                  <p className="mt-4 max-w-md text-base leading-[1.5] text-[#4D4D4D] lg:text-xl">{membro.bio}</p>
                )}
              </article>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center gap-4 px-4 lg:mt-10">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i)}
                  aria-label={`Ir para página ${i + 1}`}
                  className={cn(
                    'h-2.5 rounded-full bg-[#EC0076] transition-all',
                    i === activePage ? 'w-8' : 'w-2.5 opacity-30'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {pageCount > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo"
            className="hidden h-40 w-20 shrink-0 items-center justify-center text-[#EC0076] transition-opacity hover:opacity-80 lg:flex xl:h-[346px] xl:w-[167px]"
          >
            <img
              src={teamArrowAsset}
              alt=""
              aria-hidden="true"
              className="h-20 w-40 -rotate-90 object-contain xl:h-[167px] xl:w-[346px]"
            />
          </button>
        )}
      </div>
    </section>
  )
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))
  return pages
}

function useResponsiveLogosPerPage() {
  const [perPage, setPerPage] = useState(30)

  useEffect(() => {
    function update() {
      setPerPage(window.matchMedia('(min-width: 1024px)').matches ? 30 : 3)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return perPage
}

function AmigosSection({ amigos }: { amigos: HomeData['amigos'] }) {
  const logos = amigos.logos.filter((logo) => logo.imagem !== null)
  const logosPerPage = useResponsiveLogosPerPage()
  const pages = chunk(logos, logosPerPage)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)
  const [activePage, setActivePage] = useState(0)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    function measure() {
      if (!el || el.clientWidth === 0) return
      setPageCount(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth)))
    }
    function onScroll() {
      if (!el || el.clientWidth === 0) return
      setActivePage(Math.round(el.scrollLeft / el.clientWidth))
    }

    measure()
    el.addEventListener('scroll', onScroll)
    window.addEventListener('resize', measure)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [pages.length])

  function goNext() {
    const el = scrollerRef.current
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth, behavior: 'smooth' })
  }

  function goToPage(index: number) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    if (pageCount <= 1) return
    const id = setInterval(goNext, 10000)
    return () => clearInterval(id)
  }, [pageCount])

  return (
    <section id="amigos" className="scroll-mt-20 flex flex-col lg:flex-row">
      <div className="flex flex-col justify-center gap-6 px-6 sm:py-16 pt-16 sm:px-10 md:px-10 lg:w-[394px] lg:shrink-0 lg:px-12 lg:py-12 xl:w-[420px] xl:px-16">
        <img src={amigos.badge.src} alt={amigos.badge.alt} className="h-16 w-16 lg:h-20 lg:w-20" />

        <h2 className="flex flex-col text-4xl font-bold uppercase leading-[1.2] sm:text-5xl lg:text-6xl xl:text-[80px]">
          <span className="text-[#1a1a1a]">{amigos.tituloLinha1}</span>
          <span className="flex items-center gap-3 text-[#EC0076]">
            {amigos.tituloLinha2}
            <img src={arrowAsset} alt="" aria-hidden="true" className="h-6 w-auto -rotate-90 lg:h-8 xl:h-10" />
          </span>
        </h2>

        {amigos.descricao && (
          <p className="max-w-sm text-base text-[#4D4D4D] lg:text-lg xl:text-xl">
            {amigos.descricao}
          </p>
        )}
      </div>

      {logos.length > 0 && (
        <div className="flex flex-1 flex-col justify-center gap-4 bg-white px-6 py-10 sm:px-10 md:px-10 lg:px-12 lg:py-12 xl:px-16">
          {/* Mobile: faixa contínua estilo marquee, sem paginação */}
          <div className="-mx-6 overflow-hidden sm:hidden">
            <div
              className="logos-marquee-track flex w-max gap-8"
              style={{ animationDuration: `${logos.length * 2.5}s` }}
            >
              {[...logos, ...logos].map((logo, i) => (
                <img
                  key={i}
                  src={logo.imagem!.src}
                  alt={logo.imagem!.alt || logo.nome}
                  className="h-20 w-auto shrink-0 object-contain grayscale opacity-70"
                />
              ))}
            </div>
          </div>

          {/* Tablet/desktop: slide paginado com bolinhas */}
          <div className="hidden sm:block">
            <div
              ref={scrollerRef}
              className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth"
            >
              {pages.map((page, i) => (
                <div
                  key={i}
                  className="grid w-full shrink-0 snap-start grid-cols-2 place-items-center gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5"
                >
                  {page.map((logo, j) => (
                    <img
                      key={j}
                      src={logo.imagem!.src}
                      alt={logo.imagem!.alt || logo.nome}
                      className="h-[120px] w-[200px] object-contain grayscale opacity-70 transition-opacity hover:opacity-100"
                    />
                  ))}
                </div>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToPage(i)}
                    aria-label={`Ir para página ${i + 1}`}
                    className={cn(
                      'h-2.5 rounded-full bg-[#EC0076] transition-all',
                      i === activePage ? 'w-8' : 'w-2.5 opacity-30'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

interface Wpcf7Global {
  init: (form: HTMLFormElement) => void
  schemas: Map<number, unknown>
}

function useCf7Form(formId: number) {
  return useQuery<{ html: string }>({
    queryKey: ['cf7-form', formId],
    queryFn: () => api<{ html: string }>(`/forms/cf7/${formId}`),
    staleTime: 1000 * 60 * 5,
    enabled: formId > 0,
  })
}

function OrcamentoSection({ orcamento }: { orcamento: HomeData['orcamento'] }) {
  const { data } = useCf7Form(orcamento.formId)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !data?.html) return

    const formEl = container.querySelector<HTMLFormElement>('.wpcf7 > form')
    const cf7 = (window as unknown as { wpcf7?: Wpcf7Global }).wpcf7
    if (!formEl || !cf7?.init) return

    cf7.init(formEl)

    const formId = (formEl as unknown as { wpcf7?: { id: number } }).wpcf7?.id
    if (formId === undefined) return

    const restRoot = boot.apiBase.replace(/\/framework\/v1\/?$/, '')
    fetch(`${restRoot}/contact-form-7/v1/contact-forms/${formId}/feedback/schema`)
      .then((res) => (res.ok ? res.json() : null))
      .then((schema) => {
        if (schema) cf7.schemas.set(formId, schema)
      })
      .catch(() => {})
  }, [data?.html])

  return (
    <section id="orcamento" className="scroll-mt-20 bg-black px-4 py-16 sm:px-6 md:px-10 lg:px-16 lg:py-24 xl:px-20">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <div className="flex max-w-[515px] flex-col gap-8">
          <h2 className="flex flex-col text-4xl font-bold leading-none text-white sm:text-5xl lg:text-6xl xl:text-[80px]">
            <span className="block">{orcamento.tituloLinha1}</span>
            <span className="flex items-center gap-3 text-[#EC0076]">
              {orcamento.tituloLinha2}
              <img src={arrowAsset} alt="" aria-hidden="true" className="h-6 w-auto -rotate-90 lg:h-8 xl:h-10" />
            </span>
          </h2>

          <div className="flex flex-col gap-4 text-white">
            {orcamento.subtitulo && <p className="text-lg font-bold sm:text-xl">{orcamento.subtitulo}</p>}
            {orcamento.descricao && <p className="text-lg sm:text-xl">{orcamento.descricao}</p>}
          </div>
        </div>

        <div className="w-full rounded-[20px] border border-white/20 bg-white/5 p-6 lg:max-w-[870px] lg:p-8">
          {data?.html ? (
            <div ref={containerRef} className="cf7-form" dangerouslySetInnerHTML={{ __html: data.html }} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="h-16 w-full animate-pulse rounded-[10px] bg-white/10" />
              <div className="h-16 w-full animate-pulse rounded-[10px] bg-white/10" />
              <div className="h-36 w-full animate-pulse rounded-[10px] bg-white/10" />
              <div className="h-11 w-[190px] animate-pulse rounded-full bg-white/10" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ProjectCategoryFilters({
  categories,
  activeSlug,
  onSelect,
}: {
  categories: ProjectCategory[]
  activeSlug: string | null
  onSelect: (slug: string) => void
}) {
  if (categories.length === 0) return null

  return (
    <nav
      aria-label="Categorias de projetos"
      className="no-scrollbar w-full overflow-x-auto border-t border-[#e5e5e5] bg-white"
    >
      <div className="flex items-center gap-4 whitespace-nowrap px-4 py-6 sm:px-6 md:px-10 lg:gap-6 lg:px-16 lg:py-6 xl:px-20 xl:[&>button]:flex-[1_0_0] xl:whitespace-normal">
        {categories.map((category) => {
          const isActive = category.slug === activeSlug
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.slug)}
              className={cn(
                'shrink-0 rounded-full border border-[#EC0076] px-6 py-3 text-base font-bold uppercase transition-colors',
                isActive ? 'bg-[#EC0076] text-white' : 'bg-white text-[#4D4D4D] hover:bg-[#EC0076]/5'
              )}
            >
              {category.name}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

const PROJECT_ROW_PEEK_PX = -64

function ProjectGrid({ category }: { category: ProjectCategory }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useProjectList(category.slug)
  const projects = data?.pages.flatMap((page) => page.items) ?? []
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [clipHeight, setClipHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = gridRef.current
    if (!el || !hasNextPage) {
      setClipHeight(null)
      return
    }

    function measure() {
      if (!el || !window.matchMedia('(min-width: 1024px)').matches) {
        setClipHeight(null)
        return
      }
      const items = Array.from(el.children) as HTMLElement[]
      const firstTop = items[0]?.offsetTop
      const secondRowItem = firstTop === undefined ? undefined : items.find((item) => item.offsetTop > firstTop)
      setClipHeight(secondRowItem ? secondRowItem.offsetTop + PROJECT_ROW_PEEK_PX : null)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [hasNextPage, isLoading, projects.length])

  if (!isLoading && projects.length === 0) return null

  return (
    <>
      <section
        id="portfolio"
        className={cn(
          'relative scroll-mt-20 flex flex-col gap-8 bg-black px-4 pt-10 pb-10 sm:px-6 md:px-10 lg:gap-10 lg:px-16 lg:pt-16 xl:px-20 xl:pt-20',
          hasNextPage ? 'lg:pb-0' : 'lg:pb-16 xl:pb-20'
        )}
      >
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl xl:text-[56px]">
          {category.name}
        </h2>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-x-6 gap-y-10 overflow-hidden sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16 xl:grid-cols-4 xl:gap-y-20"
          style={clipHeight !== null ? { maxHeight: clipHeight } : undefined}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)
            : projects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => setSelectedId(project.id)} />
              ))}
        </div>

        {hasNextPage && (
          <div className="relative z-10 flex justify-center lg:hidden">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-full border border-[#EC0076] px-6 py-2.5 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:hidden"
            >
              {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
            </button>
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              aria-label="Carregar mais projetos"
              className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EC0076] text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:flex"
            >
              <img
                src={chevronDownAsset}
                alt=""
                aria-hidden="true"
                className={cn('h-4 w-auto', isFetchingNextPage && 'animate-pulse')}
              />
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[219px] bg-gradient-to-b from-transparent to-black/70 lg:hidden" />

        <ProjectModal projectId={selectedId} onClose={() => setSelectedId(null)} />
      </section>

      {hasNextPage && (
        <div className="relative z-20 -mt-8 hidden justify-center lg:flex">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            aria-label="Carregar mais projetos"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EC0076] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <img
              src={chevronDownAsset}
              alt=""
              aria-hidden="true"
              className={cn('h-4 w-auto', isFetchingNextPage && 'animate-pulse')}
            />
          </button>
        </div>
      )}
    </>
  )
}

function ProjectCard({ project, onClick }: { project: ProjectItem; onClick: () => void }) {
  return (
    <article className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onClick}
        className="block h-[280px] w-full overflow-hidden rounded-md bg-[#ccc] transition-opacity hover:opacity-90 sm:h-[320px] lg:h-[360px]"
      >
        {project.imagem && (
          <img
            src={project.imagem.src}
            alt={project.imagem.alt}
            className="h-full w-full object-cover"
          />
        )}
      </button>
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white">
          {project.logo && (
            <img src={project.logo.src} alt={project.logo.alt} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col text-white">
          <button type="button" onClick={onClick} className="w-fit text-left text-xl font-bold hover:underline">
            {project.titulo}
          </button>
          {project.subtitulo && <p className="text-base">{project.subtitulo}</p>}
        </div>
      </div>
    </article>
  )
}

function ProjectModal({ projectId, onClose }: { projectId: number | null; onClose: () => void }) {
  const { data: project, isLoading } = useProjectDetail(projectId)
  const open = projectId !== null
  const [lightbox, setLightbox] = useState<LightboxMedia | null>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) setLightbox(null)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 px-0 py-0 sm:px-6 sm:py-10 lg:px-16"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project?.titulo ?? 'Projeto'}
    >
      <div className="mx-auto flex max-w-[1280px] items-start gap-4 px-4 pb-6 pt-6 sm:px-0">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-muted" />
          ) : (
            project?.logo && (
              <img src={project.logo.src} alt={project.logo.alt} className="h-full w-full object-cover" />
            )
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-white">
          {isLoading ? (
            <>
              <div className="h-5 w-48 animate-pulse rounded bg-white/20" />
              <div className="h-4 w-64 animate-pulse rounded bg-white/20" />
            </>
          ) : (
            project && (
              <>
                <p className="text-xl font-bold">{project.titulo}</p>
                {project.subtitulo && <p className="text-base">{project.subtitulo}</p>}
              </>
            )
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="shrink-0 rounded-full p-1 text-white transition-colors hover:bg-white/10"
        >
          <X className="h-7 w-7" />
        </button>
      </div>

      <div
        className="mx-auto flex min-h-[400px] max-w-[1280px] flex-col items-center bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="flex w-full flex-col gap-8 px-6 py-10 sm:px-16 sm:py-14 lg:px-[150px] lg:py-16">
            <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
              <div className="h-10 w-2/3 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-16 flex-1 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-[280px] w-full animate-pulse rounded bg-muted sm:h-[420px] lg:h-[600px]" />
          </div>
        )}

        {project && (
          <>
            <div className="flex w-full flex-col items-start gap-8 px-6 py-10 sm:px-16 sm:py-14 lg:flex-row lg:items-center lg:px-[150px] lg:py-16">
              <h2 className="flex-1 text-3xl font-bold leading-[1.2] text-[#1a1a1a] sm:text-4xl sm:leading-[1.2] lg:text-[48px]">
                {project.titulo}
              </h2>
              {project.descricaoCompleta && (
                <p className="flex-1 text-base text-[#4D4D4D] sm:text-lg">{project.descricaoCompleta}</p>
              )}
            </div>

            {project.blocos.map((bloco, i) => (
              <ProjectBlockView key={i} bloco={bloco} onOpenMedia={setLightbox} />
            ))}
          </>
        )}
      </div>

      {project && lightbox && (
        <MediaLightbox media={lightbox} project={project} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}

function ProjectBlockView({
  bloco,
  onOpenMedia,
}: {
  bloco: ProjectBlock
  onOpenMedia: (media: LightboxMedia) => void
}) {
  if (bloco.tipo === 'texto') {
    if (!bloco.texto) return null
    return (
      <div className="flex w-full px-6 py-10 sm:px-16 sm:py-14 lg:px-[150px] lg:py-16">
        <div
          className="w-full text-base leading-relaxed text-[#4D4D4D] sm:text-lg [&_a]:underline [&_a]:text-[#EC0076] [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{ __html: bloco.texto }}
        />
      </div>
    )
  }

  if (bloco.tipo === 'imagens') {
    if (bloco.imagens.length === 0) return null
    return (
      <div className="flex w-full flex-col sm:flex-row">
        {bloco.imagens.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOpenMedia({ tipo: 'imagem', src: img.src, alt: img.alt })}
            className="h-[280px] w-full flex-1 overflow-hidden transition-opacity hover:opacity-90 sm:h-[420px] lg:h-[740px]"
          >
            <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    )
  }

  return <VideoBlock videoUrl={bloco.videoUrl} thumbnail={bloco.thumbnail} onOpenMedia={onOpenMedia} />
}

function VideoBlock({
  videoUrl,
  thumbnail,
  onOpenMedia,
}: {
  videoUrl: string
  thumbnail: ProjectImage | null
  onOpenMedia: (media: LightboxMedia) => void
}) {
  if (!videoUrl) return null

  return (
    <button
      type="button"
      onClick={() => onOpenMedia({ tipo: 'video', url: videoUrl })}
      className="relative block h-[280px] w-full overflow-hidden bg-[#ededed] sm:h-[420px] lg:h-[720px]"
    >
      {thumbnail && <img src={thumbnail.src} alt={thumbnail.alt} className="h-full w-full object-cover" />}
      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#EC0076]">
        <Play className="h-6 w-6 fill-white text-white" />
      </span>
    </button>
  )
}

function MediaLightbox({
  media,
  project,
  onClose,
}: {
  media: LightboxMedia
  project: ProjectDetail
  onClose: () => void
}) {
  const embedUrl = media.tipo === 'video' ? getVideoEmbedUrl(media.url) : null

  return (
    <div
      className="fixed inset-0 z-[60] bg-black"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={project.titulo}
    >
      <div
        className="flex h-full w-full items-center justify-center p-4 sm:p-10 lg:p-16"
        onClick={(e) => e.stopPropagation()}
      >
        {media.tipo === 'imagem' ? (
          <img
            src={media.src}
            alt={media.alt}
            className="max-h-[75vh] max-w-full object-contain sm:max-h-[80vh]"
          />
        ) : embedUrl ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            className="aspect-video max-h-[75vh] w-full max-w-full sm:max-h-[80vh]"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Vídeo do projeto"
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={media.url}
            className="max-h-[75vh] max-w-full sm:max-h-[80vh]"
            controls
            autoPlay
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[219px] bg-gradient-to-b from-transparent to-black" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Fechar"
        className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition-opacity hover:opacity-80 sm:right-12 sm:top-12"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="pointer-events-none absolute bottom-0 left-0 flex items-start gap-4 p-6 sm:p-12">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white">
          {project.logo && (
            <img src={project.logo.src} alt={project.logo.alt} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-col text-white">
          <p className="text-xl font-bold">{project.titulo}</p>
          {project.subtitulo && <p className="text-base">{project.subtitulo}</p>}
        </div>
      </div>
    </div>
  )
}

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-[280px] w-full animate-pulse rounded-md bg-white/10 sm:h-[320px] lg:h-[360px]" />
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/10" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <section className="container px-4 pb-4 sm:px-8 md:pb-6">
      <div className="min-h-[758px] animate-pulse rounded-[20px] bg-muted sm:min-h-[75vh] md:min-h-[80vh] lg:min-h-[85vh]" />
    </section>
  )
}
