export interface HomeData {
  hero: {
    tituloLinha1: string
    tituloLinha2: string
    tituloTextura: {
      src: string
      alt: string
      width: number | null
      height: number | null
    }
    descricao: string
  }
  amigos: {
    badge: {
      src: string
      alt: string
      width: number | null
      height: number | null
    }
    tituloLinha1: string
    tituloLinha2: string
    descricao: string
    logos: {
      imagem: {
        src: string
        alt: string
        width: number | null
        height: number | null
      } | null
      nome: string
    }[]
  }
  orcamento: {
    tituloLinha1: string
    tituloLinha2: string
    subtitulo: string
    descricao: string
    formId: number
  }
  stats: {
    itens: { numero: string; descricao: string }[]
    imagemMobile: {
      src: string
      alt: string
      width: number | null
      height: number | null
    }
  }
  fale: {
    tituloLinha1: string
    tituloLinha2: string
    redes: { nome: string; url: string }[]
    timeTexto: string
    timeUrl: string
  }
  time: {
    membros: {
      foto: {
        src: string
        alt: string
        width: number | null
        height: number | null
      } | null
      nome: string
      cargo: string
      bio: string
    }[]
  }
}
