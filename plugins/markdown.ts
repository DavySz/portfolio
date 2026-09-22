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

export interface ArticleHeading {
  id: string;
  text: string;
  level: number;
}

interface ArticleModule {
  html: string;
  readingMinutes: number;
  headings: ArticleHeading[];
}

/** Palavras por minuto de leitura técnica, usado para estimar o tempo. */
const WORDS_PER_MINUTE = 200;

/** Nome de exibição das linguagens; o resto cai no identificador cru. */
const LANGUAGE_NAMES: Record<string, string> = {
  typescript: "TypeScript",
  tsx: "TSX",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  bash: "Shell",
  sh: "Shell",
  nginx: "nginx",
  yaml: "YAML",
  sql: "SQL",
};

/**
 * Os textos que a marcação gerada precisa dizer, nos dois idiomas.
 *
 * O aviso de "abre em nova aba" estava só no React; os links dos artigos, que
 * saem daqui, abriam noutra aba sem avisar ninguém. E o rótulo da âncora de
 * título era português fixo, inclusive dentro dos artigos em inglês — num
 * site cuja regra é que nenhum texto visível nasce escrito no componente.
 */
type Language = "en" | "pt";

const LABELS: Record<Language, { anchor: string; newTab: string }> = {
  pt: { anchor: "Link para", newTab: "abre em nova aba" },
  en: { anchor: "Link to", newTab: "opens in new tab" },
};

/** O idioma vive no nome do arquivo: `<slug>.<lang>.md`. */
const languageOf = (file: string): Language =>
  /\.en\.md$/.test(file) ? "en" : "pt";

const createMarked = (headings: ArticleHeading[], language: Language) => {
  const labels = LABELS[language];
  /* Dois títulos com o mesmo texto geram o mesmo slug, e dois elementos com o
     mesmo `id` fazem toda âncora cair no primeiro — o sumário passaria a
     mentir em silêncio. O sufixo mantém cada destino único. */
  const usedIds = new Map<string, number>();

  const uniqueId = (base: string): string => {
    const seen = usedIds.get(base) ?? 0;
    usedIds.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };

  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = lang && hljs.getLanguage(lang) ? lang : null;
        const highlighted = language
          ? hljs.highlight(text, { language }).value
          : escapeHtml(text);
        const label = language ? (LANGUAGE_NAMES[language] ?? language) : "";

        // <figure> com barra: o nome da linguagem dá contexto e a barra vira o
        // lugar do botão de copiar, injetado em runtime pela página do artigo.
        return `<figure class="article-code" data-language="${language ?? ""}">` +
          `<figcaption class="article-code-bar">` +
          `<span class="article-code-lang">${escapeHtml(label)}</span>` +
          `</figcaption>` +
          `<pre class="article-code-pre"><code class="hljs${
            language ? ` language-${language}` : ""
          }">${highlighted}</code></pre>` +
          `</figure>`;
      },
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        // O <h1> da página é o título do artigo. Nos textos o nível mais alto
        // usado é "##", que deve virar <h2> — rebaixar criaria um salto de
        // nível (h1 -> h3), que é falha de acessibilidade. O max(2, …) só
        // protege o caso de algum artigo futuro começar com "#".
        const level = Math.max(2, depth);
        const plain = stripTags(text);
        const id = uniqueId(slugify(plain));

        // Só h2 e h3 entram no sumário; mais fundo que isso vira ruído.
        if (level <= 3) headings.push({ id, text: plain, level });

        // Âncora copiável ao lado do título, como em docs técnicas.
        return (
          `<h${level} id="${id}" class="article-heading">${text}` +
          `<a href="#${id}" class="article-anchor" aria-label="${escapeHtml(
            `${labels.anchor}: ${plain}`
          )}">#</a>` +
          `</h${level}>`
        );
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href);
        // `href` e `title` vêm do markdown sem passar por escape nenhum: uma
        // aspa no meio de qualquer um dos dois fechava o atributo e o resto
        // da URL virava marcação.
        const attrs = [
          `href="${escapeHtml(href)}"`,
          title ? `title="${escapeHtml(title)}"` : "",
          external ? 'target="_blank" rel="noreferrer noopener"' : "",
        ]
          .filter(Boolean)
          .join(" ");
        // O aviso entra como texto de verdade, não `aria-label`: assim ele
        // SOMA ao nome do link em vez de substituir o que está escrito.
        const notice = external
          ? `<span class="sr-only"> (${escapeHtml(labels.newTab)})</span>`
          : "";
        return `<a ${attrs}>${text}${notice}</a>`;
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
  return {
    name: "markdown-articles",
    enforce: "pre",

    async transform(_code, id) {
      if (!id.endsWith(".md")) return null;

      const source = readFileSync(id, "utf8");
      // um coletor por arquivo: o parser é reusado, a lista não pode ser
      const headings: ArticleHeading[] = [];
      const html = await createMarked(headings, languageOf(id)).parse(source);

      const words = stripTags(source).split(/\s+/).filter(Boolean).length;
      const module: ArticleModule = {
        html,
        readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        headings,
      };

      return {
        code: `export default ${JSON.stringify(module)};`,
        map: null,
      };
    },
  };
};
