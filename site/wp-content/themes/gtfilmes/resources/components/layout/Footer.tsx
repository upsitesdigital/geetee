import { boot } from '@/lib/env'
import swirlAsset from '@/assets/footer/swirl.svg'
import arrowAsset from '@/assets/footer/arrow.svg'

interface FooterOptions {
  footer_titulo?: string
  footer_email_1?: string
  footer_email_2?: string
  footer_telefone?: string
  footer_cidade?: string
  footer_text?: string
}

export default function Footer() {
  const opts = boot.themeOptions as FooterOptions

  const titulo   = opts.footer_titulo   || 'contato'
  const email1   = opts.footer_email_1  || 'marco@gtfilmes.com'
  const email2   = opts.footer_email_2  || 'bel@gtfilmes.com'
  const telefone = opts.footer_telefone || '+55 11 98250 5116'
  const cidade   = opts.footer_cidade   || 'São Paulo/SP'
  const text     = opts.footer_text     || '2026 Geetê Filmes. Todos os direitos reservados'

  const telHref = `tel:${telefone.replace(/[^\d+]/g, '')}`

  return (
    <footer id="contato" className="relative scroll-mt-20 overflow-hidden bg-[#EC0076]">
      {/* Tablet/desktop: swirl decorativo atrás do conteúdo, à esquerda */}
      <img
        src={swirlAsset}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 hidden h-[140%] w-auto -translate-y-1/2 opacity-90 sm:-left-16 sm:block lg:left-[4%] lg:h-[170%]"
      />

      <div className="relative flex flex-col gap-16 px-4 py-16 sm:px-10 md:px-10 lg:items-end lg:pl-16 lg:pr-[15%] lg:py-24 xl:pl-20 xl:pr-[15%]">
        <div className="flex w-full max-w-[366px] flex-col gap-10 lg:gap-16">
          <div className="flex items-center gap-4">
            <h2 className="text-5xl font-bold leading-none text-white sm:text-6xl lg:text-7xl xl:text-[80px]">
              {titulo}
            </h2>
            <img src={arrowAsset} alt="" aria-hidden="true" className="h-6 w-auto -rotate-90 lg:h-7 xl:h-8" />
          </div>

          <div className="flex flex-col gap-2 text-lg text-white sm:text-xl lg:text-2xl xl:text-[32px]">
            <a href={`mailto:${email1}`} className="w-fit transition-opacity hover:opacity-80">
              {email1}
            </a>
            <a href={`mailto:${email2}`} className="w-fit transition-opacity hover:opacity-80">
              {email2}
            </a>
            <a href={telHref} className="w-fit transition-opacity hover:opacity-80">
              {telefone}
            </a>
            <span>{cidade}</span>
          </div>
        </div>

        <div
          className="w-full max-w-[366px] text-sm text-white"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>

      {/* Mobile: swirl decorativo abaixo do conteúdo, sangrando um pouco pras laterais */}
      <img
        src={swirlAsset}
        alt=""
        aria-hidden="true"
        className="pointer-events-none -mx-[7.95%] mt-2 w-[115.9%] max-w-none opacity-90 sm:hidden"
      />
    </footer>
  )
}
