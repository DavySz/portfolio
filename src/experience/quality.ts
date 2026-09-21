/**
 * Decide o quanto de WebGL a página pode pagar ANTES de baixar o three.js.
 * Este é o único arquivo do experience importado de forma estática:
 * precisa ficar minúsculo e sem dependências.
 */
export type QualityTier = "off" | "low" | "high";

export interface Quality {
  tier: QualityTier;
  /** false = renderiza um único frame estático (prefers-reduced-motion) */
  animate: boolean;
  pixelRatio: number;
}

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Avisa quando a preferência de movimento muda.
 *
 * Antes ela era lida só na montagem: quem ligasse "reduzir movimento" com a
 * página aberta continuava vendo tudo animar até recarregar — e recarregar
 * não é uma instrução razoável para quem acabou de pedir menos movimento.
 */
export const watchReducedMotion = (
  onChange: (animate: boolean) => void
): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia(REDUCED_MOTION);
  const listener = (event: MediaQueryListEvent) => onChange(!event.matches);

  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};

export const detectQuality = (): Quality => {
  if (typeof window === "undefined") {
    return { tier: "off", animate: false, pixelRatio: 1 };
  }

  const nav = navigator as NavigatorHints;
  const animate = !window.matchMedia(REDUCED_MOTION).matches;

  if (nav.connection?.saveData) return { tier: "off", animate, pixelRatio: 1 };

  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const isLowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= 4;

  if (isCoarse || isLowMemory) return { tier: "low", animate, pixelRatio: 1 };

  return {
    tier: "high",
    animate,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  };
};
