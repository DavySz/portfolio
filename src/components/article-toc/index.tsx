import clsx from "clsx";
import { useActiveSection } from "../../hooks/useActiveSection/use-active-section";
import { useMemo } from "react";
import type { ArticleTocProps } from "./types";

/**
 * Sumário do artigo, fixo na lateral a partir de `xl`.
 *
 * As âncoras voltaram a ser `#<id>` puro: com a rota num caminho de verdade,
 * o fragmento é de novo só o pedaço da página. Enquanto a rota vivia no hash,
 * um `#<id>` derrubava o artigo e montava a home, e por isso o link precisava
 * carregar a rota inteira junto.
 *
 * Abaixo disso ele some: numa coluna estreita, um sumário empurraria o texto
 * para baixo da dobra em troca de pouco. Os títulos continuam alcançáveis
 * pelas âncoras do próprio texto.
 */
export const ArticleToc: React.FC<ArticleTocProps> = ({ headings, label }) => {
  const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const active = useActiveSection(ids);

  if (headings.length < 3) return null;

  return (
    <nav
      aria-label={label}
      className="hidden xl:block sticky top-32 max-h-[70vh] overflow-y-auto"
    >
      <p className="mb-4 font-poppins text-body-xs font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <ul className="flex flex-col gap-2 border-l border-line">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === active ? "true" : undefined}
              className={clsx(
                "-ml-px block border-l-2 py-1 font-poppins text-body-sm transition-colors duration-200",
                heading.level === 3 ? "pl-6" : "pl-4",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                heading.id === active
                  ? "border-primary-500 font-medium text-accent-strong"
                  : "border-transparent text-ink-muted hover:border-line hover:text-ink"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
