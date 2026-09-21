import clsx from "clsx";
import { useActiveSection } from "../../hooks/useActiveSection/use-active-section";
import { useMemo } from "react";
import { articleHref } from "../../hooks/useHashRoute/use-hash-route";
import type { ArticleTocProps } from "./types";

/**
 * Sumário do artigo, fixo na lateral a partir de `xl`.
 *
 * Abaixo disso ele some: numa coluna estreita, um sumário empurraria o texto
 * para baixo da dobra em troca de pouco. Os títulos continuam alcançáveis
 * pelas âncoras do próprio texto.
 */
export const ArticleToc: React.FC<ArticleTocProps> = ({
  slug,
  headings,
  label,
}) => {
  const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const active = useActiveSection(ids);

  if (headings.length < 3) return null;

  return (
    <nav
      aria-label={label}
      className="hidden xl:block sticky top-32 max-h-[70vh] overflow-y-auto"
    >
      <p className="mb-4 font-poppins text-body-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <ul className="flex flex-col gap-2 border-l border-gray-200">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={articleHref(slug, heading.id)}
              aria-current={heading.id === active ? "true" : undefined}
              className={clsx(
                "-ml-px block border-l-2 py-1 font-poppins text-body-sm transition-colors duration-200",
                heading.level === 3 ? "pl-6" : "pl-4",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                heading.id === active
                  ? "border-primary-500 font-medium text-primary-700"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
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
