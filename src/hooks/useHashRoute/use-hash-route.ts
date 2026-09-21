import { useEffect, useState } from "react";

/** Prefixo da rota de leitura: `#/artigos/<slug>`. */
export const ARTICLE_ROUTE = "#/artigos/";

/** Teto absoluto de tentativa, em ms. */
const ANCHOR_TIMEOUT = 4000;
/** Silêncio do layout que conta como "parou de mexer", em ms. */
const SETTLE_DELAY = 300;

const USER_INTENT_EVENTS = ["wheel", "touchstart", "keydown"] as const;

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
 * Leva até a âncora do hash e a mantém no lugar enquanto a página assenta.
 *
 * Duas coisas conspiram contra a âncora nesta home:
 *
 * 1. As seções são `lazy`. Quando o hash muda, o elemento de `#skills` e
 *    companhia ainda não existe no DOM, então o navegador tenta rolar, não
 *    acha e desiste.
 * 2. As seções ACIMA do alvo também são lazy, e o fallback do Suspense tem
 *    200px contra ~800px da seção real. Rolar assim que o alvo aparece não
 *    resolve: `Self` e `Services` carregam depois e empurram `#skills` mais
 *    de mil pixels para baixo.
 *
 * Por isso aqui a gente espera o elemento aparecer E continua realinhando
 * enquanto a altura do documento muda, até o layout ficar quieto. Se a pessoa
 * rolar por conta própria nesse meio tempo, a intenção dela vence e paramos.
 *
 * Nada disso vale quando a seção JÁ existe: aí quem rola é o navegador, com o
 * `scroll-behavior: smooth` do CSS. Assumir o scroll nesse caso trocaria a
 * navegação macia da home por um salto seco.
 */
export const useAnchorScroll = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    let frame = 0;
    let settleTimer = 0;
    let deadline = 0;
    let observer: ResizeObserver | null = null;
    let detachUserIntent: (() => void) | null = null;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.clearTimeout(deadline);
      observer?.disconnect();
      observer = null;
      detachUserIntent?.();
      detachUserIntent = null;
    };

    const align = (target: HTMLElement) => {
      // Instantâneo: vindo de um artigo, um scroll suave atravessaria a
      // página inteira, e cada reajuste viraria uma animação por cima da outra.
      target.scrollIntoView({ behavior: "instant", block: "start" });
    };

    const holdUntilSettled = (target: HTMLElement) => {
      const onUserIntent = () => stop();
      for (const type of USER_INTENT_EVENTS) {
        window.addEventListener(type, onUserIntent, { passive: true });
      }
      detachUserIntent = () => {
        for (const type of USER_INTENT_EVENTS) {
          window.removeEventListener(type, onUserIntent);
        }
      };

      const restartSettle = () => {
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(stop, SETTLE_DELAY);
      };

      // Cada seção lazy que entra muda a altura do body e desloca o alvo.
      observer = new ResizeObserver(() => {
        if (stopped) return;
        align(target);
        restartSettle();
      });
      observer.observe(document.body);
      restartSettle();
    };

    const scrollToHash = () => {
      stop();
      stopped = false;

      const { hash } = window.location;
      if (!hash || hash.startsWith(ARTICLE_ROUTE)) return;

      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;

      deadline = window.setTimeout(stop, ANCHOR_TIMEOUT);

      // Só assumimos o scroll se a seção não estava pronta. Se ela já existe,
      // o navegador resolve a âncora sozinho — e aí vale o `scroll-behavior:
      // smooth` do CSS, que é a navegação macia de sempre dentro da home.
      let waited = false;

      const waitForTarget = () => {
        if (stopped) return;

        const target = document.getElementById(id);
        if (target) {
          if (!waited) {
            stop();
            return;
          }
          align(target);
          holdUntilSettled(target);
          return;
        }

        waited = true;
        frame = requestAnimationFrame(waitForTarget);
      };

      frame = requestAnimationFrame(waitForTarget);
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
