import { navigate } from "../../hooks/useRoute/use-route";
import type { ArticleLinkProps } from "./types";

/**
 * Link interno para um artigo.
 *
 * É um `<a href>` de verdade, com caminho real: clique do meio, "abrir em
 * nova aba", "copiar endereço do link" e o destino na barra de status
 * continuam funcionando, e o buscador enxerga um link.
 *
 * O `onClick` só intercepta o clique primário sem modificadores — qualquer
 * outra combinação é do navegador, não nossa. Sem essa checagem, um
 * Ctrl+clique abriria a aba nova E navegaria a aba atual.
 */
export const ArticleLink: React.FC<ArticleLinkProps> = ({
  href,
  className,
  children,
  onNavigate,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const isPrimary = event.button === 0;
    const hasModifier =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (!isPrimary || hasModifier || event.defaultPrevented) return;

    event.preventDefault();
    navigate(href);
    onNavigate?.();
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
