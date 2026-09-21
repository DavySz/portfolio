/** Um bitmap e a sua variante em metade da largura, como o pipeline gera. */
export interface ImageSource {
  src: string;
  half?: string;
  width?: number;
}

export interface ResponsiveImageProps {
  /** URL da versão cheia, vinda do import do Vite. */
  src: string;
  /** Metade da largura. Ausente em SVG de vetor, que escala sozinho. */
  half?: string;
  /** Largura em px da versão cheia, usada para montar o srcset. */
  width?: number;
  alt: string;
  /** Quanto da largura da tela a imagem ocupa, por breakpoint. */
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Prioriza no carregamento; use só no elemento LCP. */
  priority?: boolean;
}
