/**
 * Gera `sitemap.xml` e `rss.xml` a partir do catálogo de artigos.
 *
 * O sitemap que existia tinha uma única URL, apontava para `www.davysz.com`
 * enquanto todo o resto do site usa `davysz.com` sem www, e estava com
 * `lastmod` de 2024. Nenhum dos oito artigos aparecia.
 *
 * O RSS não existia. Um blog técnico sem feed perde o leitor recorrente, que é
 * justamente quem volta.
 *
 * Roda no `prebuild`, então o deploy nunca publica um feed desatualizado.
 *
 * Uso: yarn content:feeds
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG = resolve(ROOT, "src/content/articles/index.ts");
const PUBLIC = resolve(ROOT, "public");

/** Sem www, para bater com o canonical do index.html e do StructuredData. */
const SITE = "https://davysz.com";
const AUTHOR = "Davy de Souza Assunção";
const TITLE = `${AUTHOR} — Artigos`;
const DESCRIPTION =
  "Artigos sobre frontend, arquitetura, fintech e a realidade do desenvolvimento de software.";

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * Lê o catálogo direto do .ts por regex em vez de importar.
 *
 * O arquivo importa imagens (`.webp`), que só o Vite sabe resolver — importá-lo
 * aqui exigiria subir um bundler só para ler metadado.
 */
const readArticles = async () => {
  const source = await readFile(CATALOG, "utf8");
  const blocks = source.split(/\n  \{\n/).slice(1);

  return blocks
    .map((block) => {
      const field = (name) =>
        block.match(new RegExp(`${name}:\\s*\\n?\\s*"([^"]*)"`))?.[1];
      const slug = field("slug");
      const title = field("title");
      const date = field("date");
      if (!slug || !title || !date) return null;
      return { slug, title, date, excerpt: field("excerpt") ?? "" };
    })
    .filter(Boolean);
};

const articles = await readArticles();
if (articles.length === 0) {
  console.error("[content:feeds] nenhum artigo lido do catálogo — abortando");
  process.exit(1);
}

const newest = articles
  .map((article) => article.date)
  .sort()
  .at(-1);

// ------------------------------------------------------------------ sitemap

const urls = [
  { loc: `${SITE}/`, lastmod: newest, priority: "1.0" },
  ...articles.map((article) => ({
    // rota por hash: é o que o site usa hoje, por não ter rewrite garantido
    loc: `${SITE}/#/artigos/${article.slug}`,
    lastmod: article.date,
    priority: "0.8",
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod, priority }) =>
      `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(resolve(PUBLIC, "sitemap.xml"), sitemap);

// ---------------------------------------------------------------------- rss

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <link>${SITE}/</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date(`${newest}T12:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${articles
  .map(
    (article) =>
      `    <item>\n` +
      `      <title>${escapeXml(article.title)}</title>\n` +
      `      <link>${SITE}/#/artigos/${article.slug}</link>\n` +
      `      <guid isPermaLink="false">${SITE}/artigos/${article.slug}</guid>\n` +
      `      <description>${escapeXml(article.excerpt)}</description>\n` +
      `      <pubDate>${new Date(`${article.date}T12:00:00Z`).toUTCString()}</pubDate>\n` +
      `      <author>${escapeXml(AUTHOR)}</author>\n` +
      `    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;

await writeFile(resolve(PUBLIC, "rss.xml"), rss);

console.log(
  `[content:feeds] sitemap.xml (${urls.length} URLs) e rss.xml (${articles.length} itens)`
);
