import clsx from "clsx";
import type { ServiceListProps } from "./types";

/**
 * Os quatro itens de expertise.
 *
 * Substitui o par `ServiceTable` + `ServiceCards`, que renderizava o mesmo
 * conteúdo com dois DOMs diferentes — uma `<table>` sem cabeçalho no desktop e
 * cards no mobile. A tabela fazia o leitor de tela anunciar "tabela, 4 linhas,
 * 4 colunas" e entrar em navegação por células, procurando relações de
 * linha/coluna que não existiam: isto sempre foi uma lista.
 *
 * Agora é uma lista só, com o mesmo DOM em qualquer largura. O que muda por
 * breakpoint é CSS: cards empilhados no mobile, faixas de duas colunas a
 * partir de `md`.
 */
export const ServiceList: React.FC<ServiceListProps> = ({ data }) => {
  return (
    <ul className="flex w-full flex-col gap-2 md:gap-0">
      {data.map(({ description, isHighlighted, title }) => (
        <li
          key={title}
          /* Sem cursor-pointer e sem realce de texto: o item não é clicável,
             então o único retorno de hover é um fundo sutil. */
          className={clsx(
            "rounded-xl px-6 py-8 transition-colors duration-300 ease-out",
            "md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center",
            "md:gap-10 md:rounded-none md:px-12 md:py-10 xl:gap-12",
            isHighlighted
              ? "bg-gradient-to-r from-primary-500 to-primary-900 hover:from-primary-400 hover:to-primary-800"
              : "bg-surface-raised hover:bg-accent/10 md:border-b md:border-line md:bg-transparent"
          )}
        >
          {/* `h3` porque o `h2` é o título da seção. Antes o desktop não
              declarava título nenhum e o mobile usava `h2`, o que tornava os
              serviços irmãos da seção que os contém. */}
          <h3
            className={clsx(
              "font-poppins font-bold text-heading-lg md:text-heading-xl xl:text-display-sm",
              isHighlighted ? "text-white" : "text-accent-strong"
            )}
          >
            {title}
          </h3>
          <p
            className={clsx(
              "mt-6 font-poppins text-body-md md:mt-0 md:text-body-lg xl:text-body-xl",
              isHighlighted ? "text-white" : "text-ink-secondary"
            )}
          >
            {description}
          </p>
        </li>
      ))}
    </ul>
  );
};
