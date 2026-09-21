import { useEffect, useState } from "react";

/** Prefixo da rota de leitura: `#/artigos/<slug>`. */
export const ARTICLE_ROUTE = "#/artigos/";

/** Teto de espera pela seção aparecer, em ms. */
const ANCHOR_TIMEOUT = 3000;

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

/**
 * Rola até a âncora do hash assim que ela existir no DOM.
 *
 * As seções da home são `lazy`, então o elemento de `#projects` e companhia
 * não está montado quando o navegador tenta rolar. Isso quebra dois casos:
 * clicar num item do menu estando num artigo (a home monta depois do salto) e
 * abrir um link direto tipo `/#skills` (a seção chega depois do primeiro
 * paint). Aqui a gente espera o elemento aparecer, com teto de tempo para não
 * ficar tentando para sempre num hash que não existe.
 */
export const useAnchorScroll = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let frame = 0;

    const scrollToHash = () => {
      cancelAnimationFrame(frame);

      const { hash } = window.location;
      if (!hash || hash.startsWith(ARTICLE_ROUTE)) return;

      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;

      const started = performance.now();
      let waited = false;

      const attempt = () => {
        if (cancelled) return;

        const target = document.getElementById(id);
        if (target) {
          // Se o elemento já estava lá, o próprio navegador tratou a âncora —
          // rolar de novo seria redundante. Só assumimos quando foi preciso
          // esperar, e aí instantâneo: vindo de um artigo, um scroll suave
          // atravessaria a página inteira.
          if (waited) {
            target.scrollIntoView({ behavior: "instant", block: "start" });
          }
          return;
        }

        waited = true;
        if (performance.now() - started > ANCHOR_TIMEOUT) return;
        frame = requestAnimationFrame(attempt);
      };

      frame = requestAnimationFrame(attempt);
    };

    // ao voltar de um artigo, o hash já é o da seção quando isto roda
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [enabled]);
};
