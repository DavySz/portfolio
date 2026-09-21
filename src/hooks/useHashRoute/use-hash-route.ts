import { useEffect, useState } from "react";

/** Prefixo da rota de leitura: `#/artigos/<slug>`. */
export const ARTICLE_ROUTE = "#/artigos/";

export const articleHref = (slug: string): string => `${ARTICLE_ROUTE}${slug}`;

const readSlug = (): string | null => {
  if (typeof window === "undefined") return null;
  const { hash } = window.location;
  if (!hash.startsWith(ARTICLE_ROUTE)) return null;
  const slug = decodeURIComponent(hash.slice(ARTICLE_ROUTE.length));
  return slug || null;
};

/**
 * Rota por hash em vez de History API.
 *
 * O site é uma SPA estática e o servidor de deploy ainda não foi definido;
 * com hash, um link direto para um artigo funciona em qualquer hospedagem,
 * sem precisar de rewrite para o index.html.
 */
export const useArticleRoute = (): string | null => {
  const [slug, setSlug] = useState<string | null>(readSlug);

  useEffect(() => {
    const onHashChange = () => setSlug(readSlug());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return slug;
};
