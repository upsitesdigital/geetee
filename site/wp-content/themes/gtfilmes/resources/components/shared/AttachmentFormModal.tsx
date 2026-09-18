import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { boot } from '@/lib/env'

interface AttachmentFormModalProps {
  open: boolean
  onClose: () => void
  formId: number
  title: string
  topOffset: number
  attachLabel?: string
}

interface Wpcf7Global {
  init: (form: HTMLFormElement) => void
  schemas: Map<number, unknown>
}

function useCf7Form(formId: number, enabled: boolean) {
  return useQuery<{ html: string }>({
    queryKey: ['cf7-form', formId],
    queryFn: () => api<{ html: string }>(`/forms/cf7/${formId}`),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && formId > 0,
  })
}

const PAPERCLIP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>'

function enhanceFileInputs(container: HTMLElement, attachLabel: string) {
  const wraps = container.querySelectorAll<HTMLElement>('.wpcf7-form-control-wrap')

  wraps.forEach((wrap) => {
    const input = wrap.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input || wrap.dataset.enhanced) return
    wrap.dataset.enhanced = '1'

    input.style.position = 'absolute'
    input.style.width = '1px'
    input.style.height = '1px'
    input.style.opacity = '0'
    input.style.overflow = 'hidden'
    input.style.pointerEvents = 'none'

    const widget = document.createElement('div')
    widget.className = 'cf7-file-widget'
    widget.innerHTML = `
      <div class="cf7-file-row">
        <span class="cf7-file-icon">${PAPERCLIP_SVG}</span>
        <span class="cf7-file-label">${attachLabel}</span>
        <button type="button" class="cf7-file-btn">Anexar</button>
      </div>
      <p class="cf7-file-name">Nenhum arquivo anexado</p>
    `

    const btn = widget.querySelector<HTMLButtonElement>('.cf7-file-btn')
    const nameEl = widget.querySelector<HTMLElement>('.cf7-file-name')
    btn?.addEventListener('click', () => input.click())
    input.addEventListener('change', () => {
      if (nameEl) nameEl.textContent = input.files?.[0]?.name || 'Nenhum arquivo anexado'
    })

    wrap.appendChild(widget)
  })
}

export default function AttachmentFormModal({
  open,
  onClose,
  formId,
  title,
  topOffset,
  attachLabel = 'Anexar arquivo',
}: AttachmentFormModalProps) {
  const { data } = useCf7Form(formId, open)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const container = containerRef.current
    if (!open || !container || !data?.html) return

    const formEl = container.querySelector<HTMLFormElement>('.wpcf7 > form')
    const cf7 = (window as unknown as { wpcf7?: Wpcf7Global }).wpcf7
    if (!formEl || !cf7?.init) return

    cf7.init(formEl)
    enhanceFileInputs(container, attachLabel)

    const cf7FormId = (formEl as unknown as { wpcf7?: { id: number } }).wpcf7?.id
    if (cf7FormId === undefined) return

    const restRoot = boot.apiBase.replace(/\/framework\/v1\/?$/, '')
    fetch(`${restRoot}/contact-form-7/v1/contact-forms/${cf7FormId}/feedback/schema`)
      .then((res) => (res.ok ? res.json() : null))
      .then((schema) => {
        if (schema) cf7.schemas.set(cf7FormId, schema)
      })
      .catch(() => {})
  }, [data?.html, open, attachLabel])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-20" style={{ top: topOffset }} onClick={onClose} />

      <div
        className="fixed bottom-0 right-0 z-30 w-full overflow-y-auto bg-[#F7F7F7] shadow-2xl sm:w-[695px]"
        style={{ top: topOffset }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex flex-col px-6 py-10 sm:px-10 sm:py-14">
          <div className="mb-10 flex items-start justify-between gap-4 lg:mb-16">
            <h2 className="text-3xl font-bold text-[#EC0076] sm:text-4xl lg:text-5xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 rounded-full p-1 text-[#4D4D4D] transition-colors hover:bg-black/5 hover:text-black"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          {data?.html ? (
            <div
              ref={containerRef}
              className="cf7-form-light rounded-[20px] border border-black/10 p-6 sm:p-8"
              dangerouslySetInnerHTML={{ __html: data.html }}
            />
          ) : (
            <div className="flex flex-col gap-4 rounded-[20px] border border-black/10 p-6 sm:p-8">
              <div className="h-16 w-full animate-pulse rounded-[10px] bg-black/5" />
              <div className="h-16 w-full animate-pulse rounded-[10px] bg-black/5" />
              <div className="h-16 w-full animate-pulse rounded-[10px] bg-black/5" />
              <div className="h-16 w-full animate-pulse rounded-[10px] bg-black/5" />
              <div className="h-11 w-[180px] animate-pulse rounded-full bg-black/10" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
