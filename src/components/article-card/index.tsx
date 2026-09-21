import { FaMedium } from "react-icons/fa";
import { articleHref } from "../../hooks/useHashRoute/use-hash-route";
import { Text } from "../text";
import type { ArticleCardProps } from "./types";

/**
 * Card de artigo.
 *
 * O card inteiro é um link para a leitura no próprio site — nada de `onClick`
 * num `div`, para funcionar com teclado, com "abrir em nova aba" e com leitor
 * de tela. O link para o Medium, quando existe, é secundário e fica fora do
 * link principal, já que links aninhados não são válidos.
 */
export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  labels,
}) => {
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-lg
                 transition-all duration-300 ease-out
                 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/10"
    >
      {article.thumb ? (
        <img
          src={article.thumb}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-[180px] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      ) : (
        /* Sem thumb: uma capa tipográfica na paleta da marca, em vez de um
           espaço vazio ou de uma imagem genérica. */
        <div
          aria-hidden="true"
          className="flex h-[180px] w-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-900 px-6"
        >
          <span className="text-center font-poppins text-heading-md font-bold text-white/90">
            {article.tag}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="font-poppins text-body-sm uppercase tracking-wider text-primary-600">
          {article.tag}
        </p>

        <Text
          as="h3"
          variant="cardTitle"
          color="primary"
          className="text-heading-md transition-colors duration-300 group-hover:text-primary-700"
        >
          {/* O link cobre o card inteiro, mas o nome acessível é só o título */}
          <a
            href={articleHref(article.slug)}
            className="after:absolute after:inset-0 after:content-['']
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {article.title}
          </a>
        </Text>

        <Text
          as="p"
          variant="cardDescription"
          color="muted"
          className="flex-1 text-body-sm"
        >
          {article.excerpt}
        </Text>

        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="font-poppins text-body-sm font-semibold text-primary-600">
            {labels.read}
          </span>

          {article.mediumUrl && (
            /* z-10 para ficar acima do ::after que cobre o card */
            <a
              href={article.mediumUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="relative z-10 inline-flex items-center gap-1.5 font-poppins text-body-sm text-gray-600
                         transition-colors duration-300 hover:text-primary-700
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <FaMedium aria-hidden="true" />
              {labels.onMedium}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
