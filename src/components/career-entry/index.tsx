import clsx from "clsx";
import type { CareerEntryProps } from "./types";
import { Text } from "../text";

/**
 * Um nó da trilha de carreira, com os detalhes atrás de um disclosure.
 *
 * O disclosure é `<details>`/`<summary>` nativo, não um botão com estado no
 * React. É o elemento que existe exatamente para isto: o teclado já abre e
 * fecha, o leitor de tela já anuncia o estado e o nome, e o conteúdo fechado
 * continua no DOM — quem usa a busca da página (Ctrl+F) encontra o texto e o
 * navegador abre o bloco. Um `aria-expanded` na mão daria o mesmo resultado
 * com mais código e mais chance de divergir.
 *
 * O trilho vertical e o marcador são desenhados com borda e um `span`, não com
 * pseudo-elemento em CSS próprio: é uma linha e um círculo, e o Tailwind
 * resolve os dois. O trilho não desce no último item, senão a linha termina no
 * vazio.
 *
 * `aria-hidden` no marcador porque ele é decoração: a ordem da lista já é a
 * ordem cronológica, e o período está escrito em cada item.
 */
export const CareerEntry: React.FC<CareerEntryProps> = ({
  company,
  role,
  period,
  summary,
  groups,
  stackLabel,
  stack,
  moreLabel,
  isCurrent = false,
  hasNext = true,
}) => {
  return (
    <li className="relative flex gap-5 md:gap-7">
      {/* Coluna da trilha. `shrink-0` para o trilho não afinar quando o
          conteúdo ao lado cresce. */}
      <div
        aria-hidden="true"
        className="relative flex w-3 shrink-0 justify-center pt-2"
      >
        <span
          className={clsx(
            "relative z-10 h-3 w-3 rounded-full ring-4 ring-page",
            isCurrent
              ? "bg-primary-500"
              : "border-2 border-primary-400 bg-page"
          )}
        />
        {hasNext && (
          <span className="absolute left-1/2 top-2 h-full w-px -translate-x-1/2 bg-line" />
        )}
      </div>

      <div className={clsx("min-w-0 flex-1", hasNext && "pb-10 md:pb-12")}>
        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
          <Text
            as="h3"
            variant="cardTitle"
            color="primary"
            className="text-heading-md md:text-heading-xl"
          >
            {company}
          </Text>
          {/* `<time>` exigiria datetime legível por máquina, e o período é um
              intervalo em texto ("jun 2024 – atual"). Um parágrafo é honesto. */}
          <Text
            as="p"
            variant="cardDescription"
            color="muted"
            className="whitespace-nowrap text-body-sm"
          >
            {period}
          </Text>
        </div>

        <Text
          as="p"
          variant="cardDescription"
          color="accent"
          className="mt-1 text-body-sm font-semibold md:text-body-md"
        >
          {role}
        </Text>

        <Text
          as="p"
          variant="cardDescription"
          color="secondary"
          className="mt-3 text-body-sm md:text-body-md"
        >
          {summary}
        </Text>

        <details className="group mt-4">
          {/* `list-none` mais a regra do marker do WebKit: o triângulo padrão
              apareceria ao lado do chevron, dois indicadores para um estado. */}
          <summary
            className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 -mx-3
                       font-poppins text-body-sm font-semibold text-accent-strong
                       transition-colors duration-200 ease-out
                       hover:bg-accent/10
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
                       [&::-webkit-details-marker]:hidden"
          >
            {moreLabel}
            {/* O ícone gira com o estado do `<details>`; o bloco global de
                prefers-reduced-motion zera a transição. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4 transition-transform duration-200 ease-out group-open:rotate-180"
            >
              <path
                d="M5 7.5 10 12.5 15 7.5"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>

          <div className="mt-4 flex flex-col gap-5 border-l-2 border-line pl-5">
            {groups.map((group) => (
              <div key={group.label}>
                {/* `h4` porque o `h3` é o nome da empresa, que é o `h2` da
                    seção partido em itens. */}
                <Text
                  as="h4"
                  variant="cardDescription"
                  color="muted"
                  className="mb-2 text-body-xs font-semibold uppercase tracking-wider"
                >
                  {group.label}
                </Text>
                <ul className="flex flex-col gap-1.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="relative pl-4 font-poppins text-body-sm leading-relaxed text-ink-secondary
                                 before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1
                                 before:rounded-full before:bg-primary-400 before:content-['']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <Text
                as="h4"
                variant="cardDescription"
                color="muted"
                className="mb-2 text-body-xs font-semibold uppercase tracking-wider"
              >
                {stackLabel}
              </Text>
              <Text
                as="p"
                variant="cardDescription"
                color="secondary"
                className="text-body-sm"
              >
                {stack}
              </Text>
            </div>
          </div>
        </details>
      </div>
    </li>
  );
};
