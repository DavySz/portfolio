/**
 * Gera um HTML por rota, a partir do `index.html` do build.
 *
 * O site é uma SPA renderizada no cliente: o HTML servido é sempre a mesma
 * casca vazia. Com rota por hash isso não tinha conserto — todas as URLs eram
 * a home. Com caminhos de verdade, cada artigo pode ter o seu HTML, com o
 * metadado certo já no que o servidor entrega.
 *
 * É a opção C1 do achado A29: só metadado, corpo continua vazio. Quem executa
 * JS (inclusive o Google) recebe a página inteira como sempre; quem não
 * executa — a maioria dos scrapers de rede social — passa a receber o cartão
 * certo em vez do cartão da home.
 *
 * Roda no `postbuild`, depois do Vite. Uso: yarn content:prerender
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIST = resolve(ROOT, "dist");
const CATALOG = resolve(ROOT, "src/content/articles/index.ts");

/** Espelha `SITE_ORIGIN` de `src/shared/site.ts`; mudam juntos. */
const SITE = "https://davysz.com";
const AUTHOR = "Davy de Souza Assunção";

/*
 * Conteúdo da 404.
 *
 * É uma página estática de verdade: o script do app é removido, então o SPA
 * não monta. Sem isso o React renderizaria a home dentro do `#root` e a 404
 * viraria uma capa por cima de uma página inteira rodando atrás — com canvas,
 * observers e tudo.
 *
 * Estilo em atributo `style` e não em classe do Tailwind: o CSS é purgado a
 * partir dos arquivos fonte, e classe escrita dentro de uma string de script
 * não é varrida — sairia sem estilo nenhum.
 */
const NOT_FOUND = {
  title: "Page not found",
  description: "This address does not exist on davysz.com.",
  markup: `<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;font-family:Poppins,sans-serif;text-align:center;padding:1.5rem">
      <p style="font-size:3.5rem;font-weight:700;margin:0;background:linear-gradient(to top right,#7947DF,#311961);-webkit-background-clip:text;background-clip:text;color:transparent">404</p>
      <h1 style="font-size:1.5rem;font-weight:600;color:#111827;margin:0">Page not found</h1>
      <p style="color:#4B5563;margin:0;max-width:34rem;line-height:1.6">This address does not exist. It may have moved, or the link may be wrong.</p>
      <p lang="pt-BR" style="color:#4B5563;margin:0;max-width:34rem;line-height:1.6">Este endereço não existe. Ele pode ter mudado, ou o link pode estar errado.</p>
      <a href="/" style="margin-top:1rem;border-radius:1.5rem;background:linear-gradient(to right,#7947DF,#311961);padding:.75rem 2rem;font-weight:600;color:#fff;text-decoration:none">Back to home</a>
    </div>`,
};

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Lê o catálogo direto do .ts por regex.
 *
 * Mesma abordagem do `build-feeds.js`: importar exigiria transpilar, e o
 * catálogo é um literal estável. Se ele virar algo dinâmico, os dois scripts
 * quebram juntos e de forma barulhenta — daí a checagem de contagem no fim.
 */
const parseCatalog = async () => {
  const source = await readFile(CATALOG, "utf8");
  const body = source.slice(
    source.indexOf("export const ARTICLES"),
    source.indexOf("export const findArticle")
  );

  const blocks = body.split(/\n  \{\n/).slice(1);

  return blocks.map((block) => {
    const pick = (key) =>
      block.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    const lang = (code) => {
      const start = block.indexOf(`${code}: {`);
      if (start < 0) return {};
      const chunk = block.slice(start, block.indexOf("},", start));
      const grab = (key) =>
        chunk.match(new RegExp(`${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
      return { title: grab("title"), excerpt: grab("excerpt"), tag: grab("tag") };
    };

    return {
      slug: pick("slug"),
      date: pick("date"),
      thumb: block.match(/thumb:\s*\{\s*src:\s*(\w+)/)?.[1],
      bodies: block.match(/bodies:\s*\[([^\]]*)\]/)?.[1] ?? "",
      en: lang("en"),
      pt: lang("pt"),
    };
  });
};

/**
 * Troca o conteúdo de uma meta que JÁ existe no HTML, ou a acrescenta.
 *
 * Trocar em vez de acrescentar é o que garante "cada meta uma vez por
 * página" — é o mesmo princípio de A15, agora no build.
 */
const setMeta = (html, attr, name, content) => {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attr}="${name}"[^>]*>`,
    "i"
  );
  const tag = `<meta ${attr}="${name}" content="${escapeAttr(content)}" />`;

  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
};

const setTitle = (html, title) =>
  html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);

const setCanonical = (html, href) => {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  const pattern = /<link\s+rel="canonical"[^>]*>/i;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
};

/**
 * Descobre o nome com hash que o Vite deu a cada thumb.
 *
 * O catálogo importa `micro-thumb.webp`; no dist ele vira
 * `micro-thumb.W0WowYVi.webp`. Sem resolver isto o `og:image` do HTML
 * divergiria do que o `useSEO` monta em runtime — e a regra é que os dois
 * digam a mesma coisa para a mesma rota.
 */
const buildThumbIndex = async () => {
  const files = await readdir(resolve(DIST, "assets"));
  const index = new Map();
  for (const file of files) {
    const base = file.replace(/\.[^.]+\.(webp|svg|png|jpe?g)$/i, "");
    if (!index.has(base)) index.set(base, `/assets/${file}`);
  }
  return index;
};

/** Mapeia o identificador do import para o arquivo fonte, no catálogo. */
const parseThumbImports = (source) => {
  const map = new Map();
  for (const m of source.matchAll(
    /import\s+(\w+)\s+from\s+"[^"]*\/([^/"]+)\.(webp|svg|png|jpe?g)"/g
  )) {
    map.set(m[1], m[2]);
  }
  return map;
};

const shell = await readFile(resolve(DIST, "index.html"), "utf8");
const catalogSource = await readFile(CATALOG, "utf8");
const thumbImports = parseThumbImports(catalogSource);
const thumbIndex = await buildThumbIndex();
const articles = await parseCatalog();

if (!articles.length || articles.some((a) => !a.slug || !a.en?.title)) {
  console.error("[content:prerender] catálogo ilegível — o formato mudou?");
  process.exit(1);
}

// ------------------------------------------------------------------- home
// A casca já vem com os valores da home; só as URLs absolutas são fixadas,
// para o canonical não depender do que o runtime fizer.
let home = setCanonical(shell, `${SITE}/`);
home = setMeta(home, "property", "og:url", `${SITE}/`);
home = setMeta(home, "name", "twitter:url", `${SITE}/`);
await writeFile(resolve(DIST, "index.html"), home);

// --------------------------------------------------------------- artigos

for (const article of articles) {
  /*
   * Inglês sempre, porque é o que o runtime faz: o i18n cai em `en` por
   * padrão, e o leitor do artigo lê `meta[language]`. Usar aqui o idioma do
   * CORPO faria o HTML servido dizer uma coisa e o `useSEO` dizer outra na
   * mesma rota. Título e resumo existem nos dois idiomas desde sempre; o que
   * pode não estar traduzido é o texto, e isso não entra no cartão.
   */
  const text = article.en;
  const url = `${SITE}/artigos/${article.slug}`;
  const thumbFile = article.thumb && thumbImports.get(article.thumb);
  const image = (thumbFile && thumbIndex.get(thumbFile)) || "/images/user.jpeg";

  let html = shell;
  html = setTitle(html, `${text.title} | ${AUTHOR}`);
  html = setCanonical(html, url);
  html = setMeta(html, "name", "description", text.excerpt);
  html = setMeta(html, "name", "keywords", text.tag);
  html = setMeta(html, "name", "author", AUTHOR);
  html = setMeta(html, "property", "og:type", "article");
  html = setMeta(html, "property", "og:title", `${text.title} | ${AUTHOR}`);
  html = setMeta(html, "property", "og:description", text.excerpt);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:locale", "en_US");
  html = setMeta(html, "property", "og:locale:alternate", "pt_BR");
  html = setMeta(html, "property", "og:image", `${SITE}${image}`);
  html = setMeta(html, "name", "twitter:image", `${SITE}${image}`);
  html = setMeta(html, "name", "twitter:title", `${text.title} | ${AUTHOR}`);
  html = setMeta(html, "name", "twitter:description", text.excerpt);
  html = setMeta(html, "name", "twitter:url", url);

  const dir = resolve(DIST, "artigos", article.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "index.html"), html);
}

// ------------------------------------------------------------------- 404
// A Vercel serve `404.html` com status 404 para qualquer caminho sem arquivo.
// É de propósito que NÃO há rewrite genérico para o index.html: uma rota
// inexistente que responde 200 com a home ensina o buscador que qualquer URL
// existe, e foi justamente disso que A29 tirou o site.
let notFound = setTitle(shell, `${NOT_FOUND.title} | ${AUTHOR}`);
notFound = setMeta(notFound, "name", "description", NOT_FOUND.description);
notFound = setMeta(notFound, "name", "robots", "noindex, follow");
notFound = setCanonical(notFound, `${SITE}/`);
notFound = notFound.replace(
  '<div id="root"></div>',
  `<div id="root">${NOT_FOUND.markup}</div>`
);
// Sem o script do app: esta página não é a SPA, é uma página só.
notFound = notFound.replace(/<script[^>]*type="module"[^>]*><\/script>/g, "");
await writeFile(resolve(DIST, "404.html"), notFound);

console.log(
  `[content:prerender] ${articles.length} artigos + home + 404 em dist/`
);
