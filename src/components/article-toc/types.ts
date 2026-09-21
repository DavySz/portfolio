export interface ArticleTocProps {
  /** Artigo a que os títulos pertencem, para o link não sair da rota. */
  headings: Array<{ id: string; text: string; level: number }>;
  label: string;
}
