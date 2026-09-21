import { FaMedium } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { articleHref } from "../../hooks/useRoute/use-route";
import { ArticleLink } from "../article-link";
import { formatCatalogDate } from "../../shared/date";
import { Text } from "../text";
import { ResponsiveImage } from "../responsive-image";
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
  text,
  labels,
}) => {
  const { i18n } = useTranslation();

  /* Mês e ano bastam numa listagem: o dia exato só importa dentro do artigo,
     onde a data completa já aparece. O `dateTime` leva o ISO, então quem lê a
     marcação recebe a data precisa de qualquer forma. */
  const published = formatCatalogDate(article.date, i18n.language, {
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-lg
                 transition-all duration-300 ease-out
                 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/10"
    >
      {article.thumb ? (
        <ResponsiveImage
          src={article.thumb.src}
          half={article.thumb.half}
          width={article.thumb.width}
          alt=""
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
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
            {text.tag}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* Com thumb, a tag precisa aparecer aqui. Sem thumb, a capa
            tipográfica acima já é a tag — repetir empilhava a mesma palavra
            duas vezes. */}
        <p className="flex flex-wrap items-center gap-x-2 font-poppins text-body-sm uppercase tracking-wider text-primary-600">
          {article.thumb && <span>{text.tag}</span>}
          {article.thumb && <span aria-hidden="true">·</span>}
          <time dateTime={article.date} className="normal-case tracking-normal text-gray-600">
            {published}
          </time>
        </p>

        <Text
          as="h3"
          variant="cardTitle"
          color="primary"
          className="text-heading-md transition-colors duration-300 group-hover:text-primary-700"
        >
          {/* O link cobre o card inteiro, mas o nome acessível é só o título */}
          <ArticleLink
            href={articleHref(article.slug)}
            className="after:absolute after:inset-0 after:content-['']
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {text.title}
          </ArticleLink>
        </Text>

        <Text
          as="p"
          variant="cardDescription"
          color="muted"
          className="flex-1 text-body-sm"
        >
          {text.excerpt}
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
