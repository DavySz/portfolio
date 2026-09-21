import type { ImageSource } from "../../components/responsive-image/types";
import type { Language } from "../../i18n";
import BFFThumb from "../../assets/bff-thumb.svg";
import ENEMThumb from "../../assets/enem-thumb.webp";
import ENEMThumbHalf from "../../assets/enem-thumb@half.webp";
import TestingThumb from "../../assets/testing-thumb.webp";
import TestingThumbHalf from "../../assets/testing-thumb@half.webp";
import MicroThumb from "../../assets/micro-thumb.webp";
import MicroThumbHalf from "../../assets/micro-thumb@half.webp";

/**
 * Catálogo dos artigos.
 *
 * Os `.md` guardam só o texto, um por idioma (`<slug>.<lang>.md`); tudo que a
 * listagem precisa saber mora aqui, para a página não ter que carregar o
 * conteúdo de nenhum deles.
 *
 * Título e resumo existem nos dois idiomas desde já, então a **lista** é
 * bilíngue por completo. O corpo pode não estar traduzido ainda: nesse caso o
 * leitor cai no português e avisa, em vez de esconder o artigo de quem navega
 * em inglês.
 */
export interface ArticleTranslation {
  title: string;
  excerpt: string;
  tag: string;
}

export interface ArticleMeta {
  slug: string;
  /** ISO 8601; usado para ordenar e para o <time>. */
  date: string;
  thumb?: ImageSource;
  /** Presente só nos que também estão publicados no Medium. */
  mediumUrl?: string;
  /** Idiomas em que o TEXTO existe. Metadado existe sempre nos dois. */
  bodies: Language[];
  en: ArticleTranslation;
  pt: ArticleTranslation;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "mais-codigo-do-que-revisar",
    date: "2026-09-21",
    bodies: ["pt"],
    en: {
      title: "More code than anyone can review",
      excerpt:
        "When planning, building and documenting stop being the bottleneck, review becomes the funnel.",
      tag: "Engineering",
    },
    pt: {
      title: "Mais código do que dá para revisar",
      excerpt:
        "Quando planejar, implementar e documentar deixam de ser o gargalo, a revisão vira o funil.",
      tag: "Engenharia",
    },
  },
  {
    slug: "o-basico-de-ia",
    date: "2026-06-02",
    bodies: ["pt"],
    en: {
      title: "The basics that separate using AI from being used by it",
      excerpt:
        "How the same principles that feel dull at first decide who actually gets value out of AI.",
      tag: "Career",
    },
    pt: {
      title: "O básico que separa quem usa IA de quem é usado por ela",
      excerpt:
        "Como os mesmos princípios que parecem chatos no começo decidem quem tira proveito da IA.",
      tag: "Carreira",
    },
  },
  {
    slug: "frontend-como-plataforma",
    date: "2026-03-28",
    bodies: ["pt"],
    en: {
      title: "Frontend as a platform",
      excerpt:
        "You are not just building screens anymore: your team became an internal provider.",
      tag: "Architecture",
    },
    pt: {
      title: "Frontend como plataforma",
      excerpt:
        "Você não está mais só construindo telas: seu time virou provedor interno.",
      tag: "Arquitetura",
    },
  },
  {
    slug: "observabilidade-no-frontend",
    date: "2026-01-11",
    bodies: ["pt"],
    en: {
      title: "Frontend observability",
      excerpt:
        "How to stop finding out about bugs on Twitter and start seeing what happens in production.",
      tag: "Observability",
    },
    pt: {
      title: "Observabilidade no Frontend",
      excerpt:
        "Como parar de descobrir bugs pelo Twitter e enxergar o que acontece em produção.",
      tag: "Observabilidade",
    },
  },
  {
    slug: "micro-frontends",
    date: "2026-01-02",
    bodies: ["pt"],
    thumb: { src: MicroThumb, half: MicroThumbHalf, width: 1200 },
    mediumUrl:
      "https://medium.com/@davysz/micro-frontends-divida-para-conquistar-77d59ff2bdcb",
    en: {
      title: "Micro frontends",
      excerpt:
        "How to turn a giant frontend into parts that independent teams can actually evolve.",
      tag: "Architecture",
    },
    pt: {
      title: "Micro Frontends",
      excerpt:
        "Como transformar seu frontend gigante em partes que times independentes conseguem evoluir.",
      tag: "Arquitetura",
    },
  },
  {
    slug: "bff-frontend-revolucao",
    date: "2025-12-14",
    bodies: ["pt", "en"],
    thumb: { src: BFFThumb },
    mediumUrl:
      "https://medium.com/@davysz/bff-por-que-o-frontend-deveria-liderar-essa-revolução-3b1f298be38a",
    en: {
      title: "BFF: why the frontend should lead this shift",
      excerpt:
        "How Backend for Frontend can change the way we build modern applications.",
      tag: "Architecture",
    },
    pt: {
      title: "BFF: por que o Frontend deveria liderar essa revolução",
      excerpt:
        "Como Backend for Frontend pode transformar a forma que desenvolvemos aplicações modernas.",
      tag: "Arquitetura",
    },
  },
  {
    slug: "testes-unitarios-no-frontend",
    date: "2025-12-14",
    bodies: ["pt", "en"],
    thumb: { src: TestingThumb, half: TestingThumbHalf, width: 1200 },
    mediumUrl:
      "https://medium.com/@davysz/testes-unitários-no-frontend-arte-de-testar-o-que-importa-c4fdb27cebf1",
    en: {
      title: "Unit testing on the frontend",
      excerpt:
        "How to drop the coverage illusion and test what actually matters.",
      tag: "Quality",
    },
    pt: {
      title: "Testes unitários no Frontend",
      excerpt:
        "Como abandonar a ilusão de cobertura e testar o que realmente importa.",
      tag: "Qualidade",
    },
  },
  {
    slug: "efeito-enem-no-codigo",
    date: "2025-12-14",
    bodies: ["pt", "en"],
    thumb: { src: ENEMThumb, half: ENEMThumbHalf, width: 1200 },
    mediumUrl:
      "https://medium.com/@davysz/o-efeito-enem-no-código-como-estudar-para-passar-criou-uma-geração-de-devs-inseguros-f3a95dde7e6c",
    en: {
      title: "The exam effect in code",
      excerpt:
        "How the habit of studying to pass created a generation of insecure developers.",
      tag: "Career",
    },
    pt: {
      title: "O efeito ENEM no código",
      excerpt:
        "Como o vício em estudar para passar criou uma geração de devs inseguros.",
      tag: "Carreira",
    },
  },
];

export const findArticle = (slug: string): ArticleMeta | undefined =>
  ARTICLES.find((article) => article.slug === slug);

/** Vizinhos na ordem da lista (mais recente primeiro) para o fim do artigo. */
export const findNeighbours = (slug: string) => {
  const index = ARTICLES.findIndex((article) => article.slug === slug);
  if (index < 0) return { previous: undefined, next: undefined };
  return { previous: ARTICLES[index - 1], next: ARTICLES[index + 1] };
};

export interface ArticleContent {
  html: string;
  readingMinutes: number;
  headings: Array<{ id: string; text: string; level: number }>;
  /** Idioma em que o texto realmente veio — pode não ser o pedido. */
  language: Language;
}

/**
 * Mapa slug+idioma → carregador. `import.meta.glob` sem `eager` dá um chunk por
 * arquivo: abrir um artigo não baixa os outros, nem a outra tradução dele.
 */
const loaders = import.meta.glob<{
  default: Omit<ArticleContent, "language">;
}>("./*.md");

export const loadArticleContent = async (
  slug: string,
  language: Language
): Promise<ArticleContent | null> => {
  const article = findArticle(slug);
  if (!article) return null;

  // Se o texto ainda não existe no idioma pedido, cai no português. Esconder o
  // artigo seria pior: ele existe e é legível, só não está traduzido.
  const resolved = article.bodies.includes(language) ? language : "pt";

  const loader = loaders[`./${slug}.${resolved}.md`];
  if (!loader) return null;

  const module = await loader();
  return { ...module.default, language: resolved };
};
