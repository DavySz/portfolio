import type { ResponsiveImageProps } from "./types";

/**
 * O React 18 não reconhece a prop camelCase `fetchPriority` — só a 19
 * reconhece — mas em minúsculas ele repassa o atributo direto ao DOM. Vai por
 * spread porque o nome minúsculo não está nos tipos de <img>.
 */
const PRIORITY_HINT = { fetchpriority: "high" } as const;

/**
 * Imagem com duas larguras.
 *
 * O pipeline (`yarn images:optimize`) gera cada bitmap na largura cheia e na
 * metade; aqui o `srcset` deixa o navegador escolher pela largura real do
 * elemento e pela densidade da tela. Sem isso, o card de artigo — que mostra
 * a imagem com cerca de 400px — recebia a versão de 1200px.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  half,
  width,
  alt,
  sizes,
  className,
  loading = "lazy",
  priority = false,
}) => (
  <img
    src={src}
    // SVG de vetor escala sozinho: srcset ali não faria sentido
    srcSet={
      half && width
        ? `${half} ${Math.round(width / 2)}w, ${src} ${width}w`
        : undefined
    }
    sizes={half ? sizes : undefined}
    alt={alt}
    aria-hidden={alt === "" ? "true" : undefined}
    loading={priority ? "eager" : loading}
    decoding="async"
    className={className}
    {...(priority ? PRIORITY_HINT : {})}
  />
);
