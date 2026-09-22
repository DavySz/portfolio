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

/** O que guardamos na entrada do histórico para o Voltar devolver o lugar. */
interface HistoryScroll {
  scrollY?: number;
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
 * Link para uma seção da home, a partir de QUALQUER rota.
 *
 * O menu e o rodapé apontavam para `#self`, `#contact` e companhia. Um
 * fragmento puro é relativo ao documento atual: dentro de um artigo, o mesmo
 * link virava `/artigos/<slug>#contact`, que é uma seção inexistente daquele
 * artigo — o clique não fazia nada, e o CTA principal do site ficava morto nas
 * oito páginas de leitura. Com a raiz escrita, o destino é sempre a home.
 */
export const sectionHref = (id: string): string => `/#${id}`;

/** True quando o caminho atual é a home. */
export const isHomePath = (pathname?: string): boolean =>
  (pathname ?? window.location.pathname).replace(/\/+$/, "") === "";

/**
 * Caminhos que a SPA sabe renderizar.
 *
 * Qualquer outro — `/pdfs/...`, `/rss.xml`, um `/artigos` sem slug — é do
 * servidor, e interceptar o clique nele trocaria um download ou uma 404 de
 * verdade por uma tela de "artigo não encontrado".
 */
export const isAppRoute = (pathname: string): boolean =>
  isHomePath(pathname) || parseRoute(pathname).slug !== null;

/**
 * O clique que é nosso para interceptar.
 *
 * Botão primário, sem modificador e ainda não tratado por outro handler.
 * Qualquer outra combinação pertence ao navegador: sem esta checagem, um
 * Ctrl+clique abriria a aba nova E navegaria a aba atual.
 */
export const isPlainLeftClick = (
  event: React.MouseEvent | MouseEvent
): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey &&
  !event.defaultPrevented;

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

/** A URL atual inteira, do jeito que o histórico a guarda. */
const currentHref = (): string =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

/** Navega para um caminho interno, como um link faria. */
export const navigate = (path: string): void => {
  if (path === currentHref()) return;

  /* Antes de sair, a entrada que fica para trás recebe a posição de leitura.
     É o que faz o Voltar devolver a pessoa ao ponto da home de onde ela abriu
     o artigo, em vez de jogá-la no topo. */
  window.history.replaceState(
    { scrollY: window.scrollY } satisfies HistoryScroll,
    "",
    currentHref()
  );
  window.history.pushState({ scrollY: 0 } satisfies HistoryScroll, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

/**
 * Persegue uma posição até o layout parar de crescer.
 *
 * As seções da home são `lazy`: logo depois de uma troca de rota o alvo ainda
 * não está no DOM, e o navegador desiste de rolar. Aqui a gente tenta uma vez
 * de imediato, espera a altura do documento ficar quieta e tenta de novo. Os
 * dois temporizadores se encerram sozinhos, então isto não depende de ciclo de
 * vida de componente.
 *
 * Só existe uma perseguição por vez: a nova cancela a anterior, senão duas
 * navegações rápidas brigariam pelo scroll.
 */
let cancelChase: (() => void) | null = null;

const chase = (land: () => void): (() => void) => {
  cancelChase?.();

  let settleTimer = 0;
  let observer: ResizeObserver | null = null;

  const stop = () => {
    window.clearTimeout(settleTimer);
    window.clearTimeout(deadline);
    observer?.disconnect();
    observer = null;
    if (cancelChase === stop) cancelChase = null;
  };

  const arrive = () => {
    land();
    stop();
  };

  const waitForQuiet = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(arrive, SETTLE_DELAY);
  };

  const deadline = window.setTimeout(stop, ANCHOR_TIMEOUT);

  observer = new ResizeObserver(waitForQuiet);
  observer.observe(document.body);
  waitForQuiet();

  cancelChase = stop;
  // Melhor esforço imediato: se o alvo já existe, a chegada não espera 150ms.
  land();

  return stop;
};

/** Rola até uma seção assim que ela existir e o layout parar de crescer. */
const landWhenSettled = (id: string): (() => void) =>
  chase(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  });

/** Devolve uma posição de scroll guardada, quando a página terminar de montar. */
const restoreWhenSettled = (scrollY: number): (() => void) =>
  chase(() => window.scrollTo({ top: scrollY, behavior: "instant" }));

/**
 * Sai do artigo e cai numa seção da home.
 *
 * Diferente de clicar no menu, que de um artigo vai para o topo e pronto:
 * quem clica em "Todos os artigos" quer a lista, então aqui a seção é
 * perseguida de propósito.
 */
export const goToSection = (id: string): void => {
  navigate(sectionHref(id));
  landWhenSettled(id);
};

/**
 * Clique num link do menu ou do rodapé — `/` ou `/#<seção>`.
 *
 * Na home o navegador já resolve a âncora sozinho, com o `scroll-behavior`
 * do CSS; fora dela o link precisa trocar de página antes de perseguir a
 * seção, e um `<a href="/#self">` faria isso recarregando o site inteiro.
 *
 * O caso de "Início" estando na home é o que parece bobo e não é: clicar num
 * link para a URL em que já se está faz o navegador **recarregar** a página.
 */
export const onMenuLinkClick = (
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string
): void => {
  if (!isPlainLeftClick(event)) return;

  const separator = href.indexOf("#");
  const id = separator < 0 ? "" : href.slice(separator + 1);

  if (!isHomePath()) {
    event.preventDefault();
    if (id) goToSection(id);
    else navigate("/");
    return;
  }

  // Âncora da própria página: é exatamente o que o navegador faz melhor.
  if (id) return;

  event.preventDefault();
  if (window.location.hash) {
    window.history.pushState(
      { scrollY: 0 } satisfies HistoryScroll,
      "",
      "/"
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  window.scrollTo({ top: 0 });
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
  /* O estado anterior é lido de um ref, não do updater do `setRoute`: decidir
     ali dentro significaria rolar a página e abrir uma View Transition de
     dentro de uma função que o React pode chamar mais de uma vez — é o que o
     StrictMode faz em desenvolvimento. */
  const routeRef = useRef(route);

  useEffect(() => {
    const apply = (next: ArticleRoute) => {
      routeRef.current = next;
      setRoute(next);
    };

    const onNavigate = (event: Event) => {
      const next = parseRoute(window.location.pathname, window.location.hash);
      const current = routeRef.current;

      // Mesma página, só o fragmento mudou: nem topo nem transição. Vale para
      // dois pontos do mesmo artigo E para as âncoras da home — que antes
      // caíam no ramo de troca de página e disparavam uma View Transition a
      // cada clique no menu.
      if (current.slug === next.slug) {
        apply(next);
        return;
      }

      const state = (event as PopStateEvent).state as HistoryScroll | null;
      const saved = typeof state?.scrollY === "number" ? state.scrollY : null;

      // Sair de um artigo devolve a página inteira. Se o histórico guardou de
      // onde a pessoa saiu, é para lá que ela volta; sem isso, o topo é o
      // único ponto de partida previsível.
      if (!next.slug && !window.location.hash) {
        if (saved && saved > 0) restoreWhenSettled(saved);
        else window.scrollTo({ top: 0, behavior: "instant" });
      }

      // View Transitions onde existe; onde não existe, troca direta. O
      // navegador tira o retrato da tela antes do callback e cruza para o
      // depois — daí a troca de estado precisar acontecer dentro dele.
      const doc = document as DocumentWithTransition;
      if (typeof doc.startViewTransition === "function") {
        doc.startViewTransition(() => {
          flushSync(() => apply(next));
        });
        return;
      }

      apply(next);
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
 * Observa apenas SE a rota atual é a home.
 *
 * O menu precisa saber disso para decidir se uma âncora é da própria página,
 * e chamar `useArticleRoute` de novo não serve: cada instância dispara a sua
 * própria View Transition, e duas transições aninhadas cancelam uma à outra.
 */
export const useIsHome = (): boolean => {
  const [home, setHome] = useState(
    () => typeof window === "undefined" || isHomePath()
  );

  useEffect(() => {
    const sync = () => setHome(isHomePath());

    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);

    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return home;
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
  /* Congela a ENTRADA inteira — hash e rota. Congelar só o hash deixava um
     `/artigos/<slug>#alguma-secao` aberto direto virar uma perseguição na
     home assim que a pessoa saísse do artigo: o alvo era um título daquele
     texto, que não existe mais na página em que ela acabou de chegar. */
  const [entry] = useState(() =>
    typeof window === "undefined"
      ? { hash: "", enabled: false }
      : { hash: window.location.hash, enabled }
  );
  const handled = useRef(false);

  useEffect(() => {
    if (!entry.enabled || handled.current) return;
    handled.current = true;

    if (!entry.hash) return;

    const id = decodeURIComponent(entry.hash.slice(1));
    if (!id || document.getElementById(id)) return;

    return landWhenSettled(id);
  }, [entry]);
};
