import BFFThumb from "../../assets/bff-thumb.svg";
import ENEMThumb from "../../assets/enem-thumb.webp";
import TestingThumb from "../../assets/testing-thumb.webp";
import MicroThumb from "../../assets/micro-thumb.webp";

/**
 * Catálogo dos artigos.
 *
 * O `.md` guarda só o texto; tudo que a listagem precisa saber mora aqui, para
 * a página de artigos não ter que carregar o conteúdo de nenhum deles.
 *
 * Os artigos são escritos em português. O site abre em inglês, então o leitor
 * marca `lang="pt-BR"` no corpo do artigo — é o que faz leitor de tela e
 * tradutor do navegador tratarem o texto no idioma certo.
 */
export interface ArticleMeta {
  slug: string;
  title: string;
  /** Linha de apoio: é a primeira linha em itálico do próprio markdown. */
  excerpt: string;
  /** ISO 8601; usado para ordenar e para o <time>. */
  date: string;
  tag: string;
  thumb?: string;
  /** Presente só nos que também estão publicados no Medium. */
  mediumUrl?: string;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "mais-codigo-do-que-revisar",
    title: "Mais código do que dá para revisar",
    excerpt:
      "Quando planejar, implementar e documentar deixam de ser o gargalo, a revisão vira o funil.",
    date: "2026-09-21",
    tag: "Engenharia",
  },
  {
    slug: "o-basico-de-ia",
    title: "O básico que separa quem usa IA de quem é usado por ela",
    excerpt:
      "Como os mesmos princípios que parecem chatos no começo decidem quem tira proveito da IA.",
    date: "2026-06-02",
    tag: "Carreira",
  },
  {
    slug: "frontend-como-plataforma",
    title: "Frontend como plataforma",
    excerpt:
      "Você não está mais só construindo telas: seu time virou provedor interno.",
    date: "2026-03-28",
    tag: "Arquitetura",
  },
  {
    slug: "observabilidade-no-frontend",
    title: "Observabilidade no Frontend",
    excerpt:
      "Como parar de descobrir bugs pelo Twitter e enxergar o que acontece em produção.",
    date: "2026-01-11",
    tag: "Observabilidade",
  },
  {
    slug: "micro-frontends",
    title: "Micro Frontends",
    excerpt:
      "Como transformar seu frontend gigante em partes que times independentes conseguem evoluir.",
    date: "2026-01-02",
    tag: "Arquitetura",
    thumb: MicroThumb,
    mediumUrl:
      "https://medium.com/@davysz/micro-frontends-divida-para-conquistar-77d59ff2bdcb",
  },
  {
    slug: "bff-frontend-revolucao",
    title: "BFF: por que o Frontend deveria liderar essa revolução",
    excerpt:
      "Como Backend for Frontend pode transformar a forma que desenvolvemos aplicações modernas.",
    date: "2025-12-14",
    tag: "Arquitetura",
    thumb: BFFThumb,
    mediumUrl:
      "https://medium.com/@davysz/bff-por-que-o-frontend-deveria-liderar-essa-revolução-3b1f298be38a",
  },
  {
    slug: "testes-unitarios-no-frontend",
    title: "Testes unitários no Frontend",
    excerpt:
      "Como abandonar a ilusão de cobertura e testar o que realmente importa.",
    date: "2025-12-14",
    tag: "Qualidade",
    thumb: TestingThumb,
    mediumUrl:
      "https://medium.com/@davysz/testes-unitários-no-frontend-arte-de-testar-o-que-importa-c4fdb27cebf1",
  },
  {
    slug: "efeito-enem-no-codigo",
    title: "O efeito ENEM no código",
    excerpt:
      "Como o vício em estudar para passar criou uma geração de devs inseguros.",
    date: "2025-12-14",
    tag: "Carreira",
    thumb: ENEMThumb,
    mediumUrl:
      "https://medium.com/@davysz/o-efeito-enem-no-código-como-estudar-para-passar-criou-uma-geração-de-devs-inseguros-f3a95dde7e6c",
  },
];

export const findArticle = (slug: string): ArticleMeta | undefined =>
  ARTICLES.find((article) => article.slug === slug);

/** Vizinhos na ordem da lista (mais recente primeiro) para o fim do artigo. */
export const findNeighbours = (slug: string) => {
  const index = ARTICLES.findIndex((article) => article.slug === slug);
  if (index < 0) return { previous: undefined, next: undefined };
  return {
    previous: ARTICLES[index - 1],
    next: ARTICLES[index + 1],
  };
};

/**
 * Mapa slug → carregador do conteúdo. `import.meta.glob` sem `eager` dá um
 * chunk por artigo: abrir um não baixa os outros sete.
 */
const loaders = import.meta.glob<{
  default: {
    html: string;
    readingMinutes: number;
    headings: Array<{ id: string; text: string; level: number }>;
  };
}>("./*.md");

export const loadArticleContent = async (slug: string) => {
  const loader = loaders[`./${slug}.md`];
  if (!loader) return null;
  const module = await loader();
  return module.default;
};
