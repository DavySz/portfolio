import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

/** Prefixo da rota de leitura: `#/artigos/<slug>`. */
export const ARTICLE_ROUTE = "#/artigos/";

/** Teto absoluto de espera pela seção, em ms. */
const ANCHOR_TIMEOUT = 4000;
/** Silêncio do layout que conta como "parou de crescer", em ms. */
const SETTLE_DELAY = 150;

export const articleHref = (slug: string): string => `${ARTICLE_ROUTE}${slug}`;

const readSlug = (): string | null => {
  if (typeof window === "undefined") return null;
  const { hash } = window.location;
  if (!hash.startsWith(ARTICLE_ROUTE)) return null;
  const slug = decodeURIComponent(hash.slice(ARTICLE_ROUTE.length));
  return slug || null;
};

type DocumentWithTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
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
    const onHashChange = () => {
      const next = readSlug();

      // Sair de um artigo devolve a página inteira: começar do topo é o único
      // ponto de partida previsível. Sem isto a home aparecia na altura em que
      // o artigo estava, e qualquer rolagem seguinte parecia aleatória.
      if (!next) window.scrollTo({ top: 0, behavior: "instant" });

      // View Transitions onde existe; onde não existe, troca direta. O
      // navegador tira o retrato da tela antes do callback e cruza para o
      // depois — daí a troca de estado precisa acontecer dentro dele.
      const doc = document as DocumentWithTransition;
      if (typeof doc.startViewTransition !== "function") {
        setSlug(next);
        return;
      }

      doc.startViewTransition(() => {
        flushSync(() => setSlug(next));
      });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return slug;
};

/**
 * Leva até a âncora do hash **uma vez**, quando a página parar de crescer.
 *
 * As seções da home são `lazy`, e as que ficam ACIMA do alvo empurram ele para
 * baixo conforme chegam. A primeira versão disto realinhava a cada mudança de
 * altura, o que virava uma sequência de saltos — especialmente ao voltar de um
 * artigo, com a animação de transição rodando junto.
 *
 * Agora é uma coisa só: espera o alvo existir E a altura do documento ficar
 * quieta, e então rola uma vez. Se a seção já estava pronta, não fazemos nada —
 * quem rola é o navegador, com o `scroll-behavior: smooth` do CSS.
 */
export const useAnchorScroll = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    let settleTimer = 0;
    let deadline = 0;
    let observer: ResizeObserver | null = null;

    const stop = () => {
      stopped = true;
      window.clearTimeout(settleTimer);
      window.clearTimeout(deadline);
      observer?.disconnect();
      observer = null;
    };

    const scrollToHash = () => {
      stop();
      stopped = false;

      const { hash } = window.location;
      if (!hash || hash.startsWith(ARTICLE_ROUTE)) return;

      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;

      // A seção já está pronta: o navegador resolve a âncora sozinho, com o
      // smooth do CSS. Assumir aqui trocaria isso por um salto seco.
      if (document.getElementById(id)) return;

      deadline = window.setTimeout(stop, ANCHOR_TIMEOUT);

      /** Rola uma vez, quando o alvo existe e a página parou de crescer. */
      const land = () => {
        if (stopped) return;
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "instant" });
        stop();
      };

      const waitForQuiet = () => {
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(land, SETTLE_DELAY);
      };

      observer = new ResizeObserver(waitForQuiet);
      observer.observe(document.body);
      waitForQuiet();
    };

    // Ao chegar de um artigo, o hash já é o da seção quando isto roda.
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      stop();
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [enabled]);
};
