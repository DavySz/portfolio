/** Módulos `.md` são convertidos em HTML pelo plugin em plugins/markdown.ts. */
declare module "*.md" {
  const article: {
    html: string;
    readingMinutes: number;
  };
  export default article;
}
