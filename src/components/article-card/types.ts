import type { ArticleMeta, ArticleTranslation } from "../../content/articles";

export interface ArticleCardProps {
  article: ArticleMeta;
  /** Título, resumo e tag já resolvidos no idioma ativo. */
  text: ArticleTranslation;
  labels: {
    read: string;
    onMedium: string;
  };
}
