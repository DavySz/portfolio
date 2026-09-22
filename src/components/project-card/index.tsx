import { useTranslation } from "react-i18next";
import type { ProjectCardProps } from "./types";
import { Text } from "../text";
import { ResponsiveImage } from "../responsive-image";

/**
 * Card de case study.
 *
 * O card INTEIRO é o link, como no `ArticleCard`: o `::after` do `<a>` se
 * estica por cima de tudo, então a imagem e o título também são área de
 * clique, e o nome acessível continua sendo só o título.
 *
 * O `isolate` no card e os `pointer-events-none` nas duas camadas de hover
 * são o que faz isso funcionar. Antes o bloco de texto era `relative`, e um
 * `absolute inset-0` mede a partir do ancestral posicionado mais próximo: a
 * área de clique cobria só o rodapé do card. As camadas de hover, mesmo
 * invisíveis em `opacity-0`, continuavam recebendo ponteiro e engoliam o
 * clique sobre a imagem.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  category,
  thumb,
  title,
  link,
}) => {
  const { t: tc } = useTranslation("component");

  return (
    <div
      className="group relative isolate flex flex-col w-full h-full min-h-[400px] md:min-h-[500px] rounded-[20px] shadow-lg dark:shadow-none dark:border dark:border-line bg-surface-raised
                 transition-all duration-300 ease-out
                 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-2
                 transform active:scale-95
                 overflow-hidden"
    >
      {/* `-z-10` em vez de `z-10`: com o `isolate` acima, a tinta de hover
          fica dentro do card, acima do fundo e atrás do conteúdo — que era o
          efeito que o `z-20` no texto existia para preservar. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out
                      rounded-[20px] -z-10 pointer-events-none"
      />

      <div className="flex flex-col justify-center relative">
        <ResponsiveImage
          src={thumb.src}
          half={thumb.half}
          width={thumb.width}
          alt=""
          sizes="(min-width: 1280px) 600px, 100vw"
          className="h-[200px] md:h-[389px] w-full rounded-t-[20px] transition-transform duration-300 ease-out group-hover:scale-105 object-cover"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 ease-out rounded-t-[20px]
                        pointer-events-none flex items-center justify-center"
        >
          <div
            className="bg-white/90 backdrop-blur-sm rounded-full p-3
                          transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"
          >
            <svg
              className="w-6 h-6 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 md:py-8 px-4 md:px-14 flex flex-col justify-between gap-2">
        <div className="flex flex-col gap-2">
          <Text
            as="h3"
            variant="cardTitle"
            color="primary"
            className="text-heading-md md:text-heading-xl group-hover:text-accent-strong transition-colors duration-300 leading-snug"
          >
            {/* Link de verdade, não div com onClick: o ::after cobre o card
                inteiro, mas dá para chegar por teclado e abrir em nova aba.

                O anel de foco vai no ::after, não no `<a>`: o texto do título
                é só um pedaço do card, e destacar apenas ele deixaria quem
                navega por teclado sem ver o que está prestes a abrir. */}
            <a
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              className="outline-none
                         after:absolute after:inset-0 after:content-[''] after:rounded-[20px]
                         focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-focus"
            >
              {title}
              {/* Mesma regra do resto do site: o aviso é texto de verdade,
                  para SOMAR ao nome do link em vez de substituí-lo. */}
              <span className="sr-only"> — {tc("a11y.opensInNewTab")}</span>
            </a>
          </Text>
          <Text
            as="p"
            variant="cardDescription"
            color="muted"
            className="text-body-md group-hover:text-accent transition-colors duration-300"
          >
            {category}
          </Text>
        </div>
      </div>
    </div>
  );
};
