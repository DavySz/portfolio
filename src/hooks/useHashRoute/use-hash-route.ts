import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

/** Prefixo da rota de leitura: `#/artigos/<slug>`. */
export const ARTICLE_ROUTE = "#/artigos/";

/** Teto absoluto de espera pela seção, em ms. */
const ANCHOR_TIMEOUT = 4000;
/** Silêncio do layout que conta como "parou de crescer", em ms. */
const SETTLE_DELAY = 150;

/**
 * A âncora de uma seção do artigo vive DENTRO da rota dele:
 * `#/artigos/<slug>/<heading>`.
 *
 * Com `#<heading>` puro — que é o que o sumário usava — o hash deixava de
 * começar com o prefixo da rota, a rota virava nula e a home montava no lugar
 * do artigo. Aninhar mantém o link real, copiável e compartilhável.
 */
export const articleHref = (slug: string, heading?: string): string =>
  heading ? `${ARTICLE_ROUTE}${slug}/${heading}` : `${ARTICLE_ROUTE}${slug}`;

export interface ArticleRoute {
  slug: string | null;
  heading: string | null;
}

const readRoute = (): ArticleRoute => {
  if (typeof window === "undefined") return { slug: null, heading: null };

  const { hash } = window.location;
  if (!hash.startsWith(ARTICLE_ROUTE)) return { slug: null, heading: null };

  const rest = decodeURIComponent(hash.slice(ARTICLE_ROUTE.length));
  const separator = rest.indexOf("/");

  if (separator < 0) return { slug: rest || null, heading: null };
  return {
    slug: rest.slice(0, separator) || null,
    heading: rest.slice(separator + 1) || null,
  };
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
export const useArticleRoute = (): ArticleRoute => {
  const [route, setRoute] = useState<ArticleRoute>(readRoute);

  useEffect(() => {
    const onHashChange = () => {
      const next = readRoute();

      setRoute((current) => {
        // Pular entre seções do MESMO artigo não é troca de página: nada de
        // voltar ao topo nem de animar a transição. Só o destino muda.
        if (current.slug && current.slug === next.slug) return next;

        // Sair de um artigo devolve a página inteira: começar do topo é o
        // único ponto de partida previsível para o que vem depois.
        if (!next.slug) window.scrollTo({ top: 0, behavior: "instant" });

        // View Transitions onde existe; onde não existe, troca direta. O
        // navegador tira o retrato da tela antes do callback e cruza para o
        // depois — daí a troca de estado precisa acontecer dentro dele.
        const doc = document as DocumentWithTransition;
        if (typeof doc.startViewTransition === "function") {
          doc.startViewTransition(() => {
            flushSync(() => setRoute(next));
          });
          return current;
        }

        return next;
      });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
};

/**
 * Rola até uma seção assim que ela existir e o layout parar de crescer.
 *
 * As seções da home são `lazy`: logo depois de uma troca de rota o alvo ainda
 * não está no DOM, e o navegador desiste de rolar. Aqui a gente espera a
 * altura do documento ficar quieta e rola uma vez. Os dois temporizadores se
 * encerram sozinhos, então isto não depende de ciclo de vida de componente.
 *
 * Devolve um cancelador para quem quiser desistir antes.
 */
const landWhenSettled = (id: string): (() => void) => {
  let settleTimer = 0;
  let observer: ResizeObserver | null = null;

  const stop = () => {
    window.clearTimeout(settleTimer);
    window.clearTimeout(deadline);
    observer?.disconnect();
    observer = null;
  };

  const land = () => {
    document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
    stop();
  };

  const waitForQuiet = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(land, SETTLE_DELAY);
  };

  const deadline = window.setTimeout(stop, ANCHOR_TIMEOUT);

  observer = new ResizeObserver(waitForQuiet);
  observer.observe(document.body);
  waitForQuiet();

  return stop;
};

/**
 * Sai do artigo e cai numa seção da home.
 *
 * Diferente de clicar no menu, que de um artigo vai para o topo e pronto:
 * quem clica em "Todos os artigos" quer a lista, então aqui a seção é
 * perseguida de propósito.
 */
export const goToSection = (id: string): void => {
  window.location.hash = id;
  landWhenSettled(id);
};

/**
 * Leva até a âncora do hash **só quando a página abre nela**.
 *
 * Existe para um caso só: alguém colar `davysz.com/#skills` numa aba nova. As
 * seções da home são `lazy`, então o alvo não está no DOM quando o navegador
 * tenta rolar, e ele desiste.
 *
 * Navegação dentro do site NÃO passa por aqui:
 *
 * - dentro da home, a seção já existe e quem rola é o navegador, com o
 *   `scroll-behavior: smooth` do CSS;
 * - vindo de um artigo pelo menu, o destino é o topo da home e ponto.
 *   Perseguir a seção enquanto a página se monta era justamente o que dava
 *   errado. Quem quer perseguir pede por `goToSection`.
 */
export const useAnchorScroll = (enabled: boolean): void => {
  // Congela o hash de abertura: o que vier depois é navegação, não entrada.
  const [entryHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash
  );
  const handled = useRef(false);

  useEffect(() => {
    if (!enabled || handled.current) return;
    handled.current = true;

    // Abriu num artigo: nada a fazer aqui, nem agora nem quando a pessoa
    // voltar para a home pelo menu.
    if (!entryHash || entryHash.startsWith(ARTICLE_ROUTE)) return;

    const id = decodeURIComponent(entryHash.slice(1));
    if (!id || document.getElementById(id)) return;

    return landWhenSettled(id);
  }, [enabled, entryHash]);
};
