import type { ArticleMeta } from "../../content/articles";

export interface ArticleCardProps {
  article: ArticleMeta;
  labels: {
    read: string;
    onMedium: string;
  };
}
