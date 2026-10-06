import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { boot } from '@/lib/env'
import { cn } from '@/lib/cn'

function Flag({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" className="h-7 w-7 max-w-none shrink-0 rounded-[50%] object-cover" />
}

// Seletor de idiomas do TranslatePress. A troca recarrega a página na URL do
// idioma (o TranslatePress traduz a resposta no servidor).
export default function LanguageSwitcher() {
  const languages = boot.languages ?? []
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (!open) return
    function handleClick(e: globalThis.MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (languages.length < 2) return null

  const current = languages.find((l) => l.current) ?? languages[0]

  return (
    <div ref={ref} className="relative shrink-0" data-no-translation>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${current.label}`}
        className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-80"
      >
        <Flag src={current.flagUrl} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-1/2 top-full z-50 mt-2 flex -translate-x-1/2 flex-col gap-1 rounded-2xl bg-white p-2 shadow-xl"
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <a
                href={`${lang.baseUrl}${pathname}${search}${hash}`}
                hrefLang={lang.code.replace('_', '-')}
                role="option"
                aria-selected={lang.current}
                aria-label={lang.label}
                title={lang.label}
                className={cn(
                  'flex rounded-full p-1.5 transition-colors hover:bg-[#F7F7F7]',
                  lang.current && 'bg-[#F7F7F7]',
                )}
              >
                <Flag src={lang.flagUrl} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
