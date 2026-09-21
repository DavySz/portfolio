/**
 * Identidade pública do site, num lugar só.
 *
 * Toda URL absoluta do projeto sai daqui: canonical, `og:url`, `twitter:url`,
 * sitemap, RSS e o structured-data. Antes o host aparecia escrito à mão em 24
 * pontos, e já houve divergência — o sitemap apontava para `www.davysz.com`
 * enquanto o resto usava o apex.
 *
 * O apex é o canônico na Vercel; `www` redireciona para cá. Trocar isso é
 * trocar esta linha e a configuração do domínio, nada mais.
 */
export const SITE_ORIGIN = "https://davysz.com";

/** Prefixo da rota de leitura. Sem barra final, como o resto das URLs. */
export const ARTICLE_PATH = "/artigos";

/**
 * URL absoluta de um caminho interno.
 *
 * `trailingSlash: false` no `vercel.json`: a home é a única com barra, porque
 * `https://davysz.com/` é a raiz, não um diretório.
 */
export const absoluteUrl = (path = "/"): string => {
  if (path === "/" || path === "") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`.replace(
    /\/+$/,
    ""
  );
};

/** Caminho interno de um artigo. */
export const articlePath = (slug: string): string => `${ARTICLE_PATH}/${slug}`;

/** URL absoluta de um artigo — o canonical dele. */
export const articleUrl = (slug: string): string =>
  absoluteUrl(articlePath(slug));
