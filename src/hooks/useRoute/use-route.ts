import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ARTICLE_PATH, articlePath } from "../../shared/site";

/** Teto absoluto de espera pela seção, em ms. */
const ANCHOR_TIMEOUT = 4000;
/** Silêncio do layout que conta como "parou de crescer", em ms. */
const SETTLE_DELAY = 150;

/** Prefixo do formato antigo, de quando a rota vivia no fragmento. */
export const LEGACY_ARTICLE_HASH = "#/artigos/";

export interface ArticleRoute {
  slug: string | null;
  heading: string | null;
}

/**
 * A âncora de uma seção do artigo vive DENTRO da rota dele:
 * `/artigos/<slug>#<heading>`.
 *
 * Agora que a rota é um caminho de verdade, o fragmento volta a ser o que
 * sempre foi: o pedaço da página. Antes, com a rota no hash, um `#<heading>`
 * puro derrubava o artigo e montava a home — daí ele ter sido aninhado como
 * `#/artigos/<slug>/<heading>`.
 */
export const articleHref = (slug: string, heading?: string): string =>
  heading ? `${articlePath(slug)}#${heading}` : articlePath(slug);

/**
 * Lê a rota do caminho atual.
 *
 * Tolera barra final mesmo com `trailingSlash: false` na Vercel: o
 * redirecionamento acontece no servidor, e no cliente o histórico pode
 * carregar a forma com barra.
 */
export const parseRoute = (pathname: string, hash = ""): ArticleRoute => {
  const trimmed = pathname.replace(/\/+$/, "");

  if (trimmed !== ARTICLE_PATH && !trimmed.startsWith(`${ARTICLE_PATH}/`)) {
    return { slug: null, heading: null };
  }

  const slug = decodeURIComponent(trimmed.slice(ARTICLE_PATH.length + 1));
  if (!slug || slug.includes("/")) return { slug: slug || null, heading: null };

  const heading = hash.startsWith("#")
    ? decodeURIComponent(hash.slice(1))
    : "";

  return { slug, heading: heading || null };
};

/**
 * Converte um link antigo `#/artigos/<slug>` no caminho equivalente.
 *
 * Devolve `null` para qualquer outra coisa — inclusive `#skills` e os demais
 * hashes de seção da home, que continuam sendo âncoras legítimas.
 */
export const legacyHashToPath = (hash: string): string | null => {
  if (!hash.startsWith(LEGACY_ARTICLE_HASH)) return null;

  const rest = decodeURIComponent(hash.slice(LEGACY_ARTICLE_HASH.length));
  if (!rest) return null;

  const separator = rest.indexOf("/");
  const slug = separator < 0 ? rest : rest.slice(0, separator);
  if (!slug) return null;

  const heading = separator < 0 ? "" : rest.slice(separator + 1);
  return heading ? `${articlePath(slug)}#${heading}` : articlePath(slug);
};

/**
 * Traz links antigos para o formato novo, uma vez, no boot.
 *
 * **Este código é permanente.** O fragmento nunca chega ao servidor, então
 * nenhum redirecionamento da Vercel alcança `#/artigos/<slug>` — só o cliente
 * consegue. Os quatro artigos publicados no Medium apontam para cá no formato
 * antigo, e o que já foi compartilhado em LinkedIn também. Remover isto
 * transforma todos esses links em "abriu na home".
 *
 * `replaceState` em vez de `pushState`: a URL antiga não deve virar uma etapa
 * do histórico, senão o botão Voltar devolve a pessoa para o redirecionamento.
 */
export const redirectLegacyHash = (): void => {
  if (typeof window === "undefined") return;

  const path = legacyHashToPath(window.location.hash);
  if (!path) return;

  window.history.replaceState(null, "", path);
};

type DocumentWithTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

/** Navega para um caminho interno, como um link faria. */
export const navigate = (path: string): void => {
  if (path === `${window.location.pathname}${window.location.hash}`) return;
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

/**
 * Rota por caminho, sobre a History API.
 *
 * Era por hash, porque a hospedagem ainda não estava definida e um fragmento
 * funciona em qualquer servidor estático sem rewrite. O custo disso era alto:
 * o fragmento não é enviado ao servidor nem faz parte da identidade de uma URL
 * para o buscador, então os oito artigos eram a mesma URL que a home — o
 * próprio sitemap declarava nove endereços que colapsavam em um.
 */
export const useArticleRoute = (): ArticleRoute => {
  const [route, setRoute] = useState<ArticleRoute>(() =>
    typeof window === "undefined"
      ? { slug: null, heading: null }
      : parseRoute(window.location.pathname, window.location.hash)
  );

  useEffect(() => {
    const onNavigate = () => {
      const next = parseRoute(window.location.pathname, window.location.hash);

      setRoute((current) => {
        // Pular entre seções do MESMO artigo não é troca de página: nada de
        // voltar ao topo nem de animar a transição. Só o destino muda.
        if (current.slug && current.slug === next.slug) return next;

        // Sair de um artigo devolve a página inteira: começar do topo é o
        // único ponto de partida previsível para o que vem depois.
        if (!next.slug && !window.location.hash) {
          window.scrollTo({ top: 0, behavior: "instant" });
        }

        // View Transitions onde existe; onde não existe, troca direta. O
        // navegador tira o retrato da tela antes do callback e cruza para o
        // depois — daí a troca de estado precisar acontecer dentro dele.
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

    window.addEventListener("popstate", onNavigate);
    // O hash ainda muda sozinho quando se clica numa âncora de seção
    window.addEventListener("hashchange", onNavigate);

    return () => {
      window.removeEventListener("popstate", onNavigate);
      window.removeEventListener("hashchange", onNavigate);
    };
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
  navigate(`/#${id}`);
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

    if (!entryHash) return;

    const id = decodeURIComponent(entryHash.slice(1));
    if (!id || document.getElementById(id)) return;

    return landWhenSettled(id);
  }, [enabled, entryHash]);
};
