import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, FileImage, Handshake, MessageSquare, Users, X } from 'lucide-react'
import { boot } from '@/lib/env'
import logoAsset from '@/assets/header/logo.svg'
import menuIconAsset from '@/assets/header/menu-icon.svg'
import AttachmentFormModal from '@/components/shared/AttachmentFormModal'

interface HeaderOptions {
  site_name?: string
  logo_url?: string
  header_cta_1_text?: string
  header_cta_1_url?: string
  header_cta_2_text?: string
  header_cta_2_url?: string
  header_jobs_form_id?: number
  header_portfolio_form_id?: number
}

function resolveHref(url: string): string {
  const siteUrl = boot.siteUrl.replace(/\/$/, '')
  return url.startsWith(siteUrl) ? url.slice(siteUrl.length) || '/' : url
}

function isExternal(url: string): boolean {
  return url.startsWith('http') && !url.startsWith(boot.siteUrl)
}

const NAV_LINKS = [
  { id: 'portfolio', label: 'Nosso portfólio', icon: FileImage },
  { id: 'amigos', label: 'Nossos amigos', icon: Handshake },
  { id: 'equipe', label: 'Conheça nossa equipe', icon: Users },
  { id: 'contato', label: 'Contato', icon: MessageSquare },
]

// ─── CtaButton ────────────────────────────────────────────────────────────────

function CtaButton({ text, url, onClick }: { text: string; url?: string; onClick?: () => void }) {
  const cls =
    'flex w-[180px] shrink-0 items-center justify-center rounded-full bg-[#EC0076] px-6 py-2.5 text-base font-medium text-white transition-opacity hover:opacity-90'

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {text}
      </button>
    )
  }

  const external = url ? isExternal(url) : false
  const href = url || '#'

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {text}
      </a>
    )
  }
  return (
    <Link to={resolveHref(href)} className={cls}>
      {text}
    </Link>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [jobsOpen, setJobsOpen] = useState(false)
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.target.getBoundingClientRect().height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const opts = boot.themeOptions as HeaderOptions
  const siteName = opts.site_name || 'Geeteê filmes'
  const logoUrl  = opts.logo_url  || ''
  const cta1Text = opts.header_cta_1_text || 'Manda Portfólio'
  const cta2Text = opts.header_cta_2_text || 'Manda Jobs'
  const jobsFormId = opts.header_jobs_form_id || 32
  const portfolioFormId = opts.header_portfolio_form_id || 33

  function openJobsModal() {
    setMenuOpen(false)
    setJobsOpen(true)
  }

  function openPortfolioModal() {
    setMenuOpen(false)
    setPortfolioOpen(true)
  }

  function handleAnchorClick(e: MouseEvent<HTMLAnchorElement>, id: string) {
    setMenuOpen(false)
    if (pathname !== '/') return

    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: 'smooth' })
  }

  function closeOpenForms() {
    if (jobsOpen) setJobsOpen(false)
    if (portfolioOpen) setPortfolioOpen(false)
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full border-border bg-white">
      <div
        onClick={closeOpenForms}
        className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-10 lg:px-16 xl:px-20"
      >

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src={logoUrl || logoAsset}
            alt={siteName}
            className="h-8 w-auto object-contain md:h-9"
          />
        </Link>

        {/* Marca central (decorativa)
        <img
          src={badgeAsset}
          alt=""
          aria-hidden="true"
          className="hidden h-9 w-auto shrink-0 object-contain lg:block"
        /> */}

        {/* Ações à direita */}
        <div className="flex items-center gap-4 lg:gap-10">
          <div className="hidden items-center gap-4 md:flex">
            <CtaButton text={cta1Text} onClick={openPortfolioModal} />
            <CtaButton text={cta2Text} onClick={openJobsModal} />
          </div>

          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-8 w-8 text-[#EC0076]" />
            ) : (
              <img src={menuIconAsset} alt="" aria-hidden="true" className="h-8 w-8" />
            )}
          </button>
        </div>
      </div>

      {/* Dropdown do menu hambúrguer */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />

          <div className="absolute right-4 top-full z-40 mt-2 w-[calc(100%-2rem)] max-w-[360px] rounded-2xl bg-white p-6 shadow-xl sm:right-6 md:right-10 lg:right-16 xl:right-20">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`/#${id}`}
                  onClick={(e) => handleAnchorClick(e, id)}
                  className="group flex items-center justify-between gap-2 rounded-md p-2.5 text-lg text-[#4D4D4D] transition-colors hover:bg-[#F7F7F7]"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-[#EC0076] opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </nav>

            <a
              href="/#orcamento"
              onClick={(e) => handleAnchorClick(e, 'orcamento')}
              className="mt-8 flex items-center justify-center rounded-full border border-[#EC0076] px-6 py-2.5 text-base font-medium text-[#EC0076] transition-colors hover:bg-[#EC0076]/5"
            >
              Solicite um orçamento
            </a>

            {/* CTAs extras no mobile (fora do Figma, preservam a função dos botões do header) */}
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 md:hidden">
              <CtaButton text={cta1Text} onClick={openPortfolioModal} />
              <CtaButton text={cta2Text} onClick={openJobsModal} />
            </div>
          </div>
        </>
      )}

      <AttachmentFormModal
        open={jobsOpen}
        onClose={() => setJobsOpen(false)}
        topOffset={headerHeight}
        formId={jobsFormId}
        title="#mandajobs"
        attachLabel="Anexar Briefing"
      />

      <AttachmentFormModal
        open={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        topOffset={headerHeight}
        formId={portfolioFormId}
        title="#mandaportifa"
        attachLabel="Anexar Portfólio"
      />
    </header>
  )
}
