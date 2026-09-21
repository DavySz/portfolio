/** Módulos `.md` são convertidos em HTML pelo plugin em plugins/markdown.ts. */
declare module "*.md" {
  const article: {
    html: string;
    readingMinutes: number;
    headings: Array<{ id: string; text: string; level: number }>;
  };
  export default article;
}
