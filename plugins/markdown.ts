import { readFileSync } from "node:fs";
import { Marked } from "marked";
import hljs from "highlight.js";
import type { Plugin } from "vite";

/**
 * Converte os `.md` dos artigos em HTML **em tempo de build**.
 *
 * O objetivo é não embarcar nenhuma biblioteca de markdown no site: `marked` e
 * `highlight.js` são devDependencies e rodam só aqui. Cada `.md` vira um módulo
 * que exporta HTML pronto, então o Vite o trata como qualquer outro módulo e o
 * separa em chunk próprio quando importado dinamicamente.
 *
 * O destaque de sintaxe usa **classes** (`hljs-keyword`, …) em vez de estilo
 * inline: o tema vive uma vez no CSS e o HTML de cada artigo fica curto.
 */

interface ArticleModule {
  html: string;
  readingMinutes: number;
}

/** Palavras por minuto de leitura técnica, usado para estimar o tempo. */
const WORDS_PER_MINUTE = 200;

const createMarked = () => {
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = lang && hljs.getLanguage(lang) ? lang : null;
        const highlighted = language
          ? hljs.highlight(text, { language }).value
          : escapeHtml(text);

        return `<pre class="article-code"><code class="hljs${
          language ? ` language-${language}` : ""
        }">${highlighted}</code></pre>`;
      },
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        // O <h1> da página é o título do artigo. Nos textos o nível mais alto
        // usado é "##", que deve virar <h2> — rebaixar criaria um salto de
        // nível (h1 -> h3), que é falha de acessibilidade. O max(2, …) só
        // protege o caso de algum artigo futuro começar com "#".
        const level = Math.max(2, depth);
        const id = slugify(stripTags(text));
        return `<h${level} id="${id}">${text}</h${level}>`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href);
        const attrs = [
          `href="${href}"`,
          title ? `title="${title}"` : "",
          external ? 'target="_blank" rel="noreferrer noopener"' : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<a ${attrs}>${text}</a>`;
      },
    },
  });

  return marked;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const stripTags = (value: string): string => value.replace(/<[^>]*>/g, "");

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const markdownArticles = (): Plugin => {
  const marked = createMarked();

  return {
    name: "markdown-articles",
    enforce: "pre",

    async transform(_code, id) {
      if (!id.endsWith(".md")) return null;

      const source = readFileSync(id, "utf8");
      const html = await marked.parse(source);

      const words = stripTags(source).split(/\s+/).filter(Boolean).length;
      const module: ArticleModule = {
        html,
        readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
      };

      return {
        code: `export default ${JSON.stringify(module)};`,
        map: null,
      };
    },
  };
};
