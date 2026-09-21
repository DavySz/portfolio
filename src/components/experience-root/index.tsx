import { useEffect, useRef } from "react";
import clsx from "clsx";
import { detectQuality } from "../../experience/quality";
import type { Experience } from "../../experience/Experience";
import type { ExperienceRootProps } from "./types";

/**
 * Camada única e fixa atrás da página inteira. Fica no PageTemplate e não
 * remonta ao navegar: as seções é que entram e saem do registro.
 *
 * three.js vai num chunk separado (import dinâmico) e nunca entra no caminho
 * do LCP. Enquanto ele não assume, quem aparece é o fallback CSS de cada
 * seção; o atributo data-experience avisa o CSS quando pode sair de cena.
 */
const LIVE_ATTRIBUTE = "experience";

export const ExperienceRoot: React.FC<ExperienceRootProps> = ({
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const quality = detectQuality();
    if (quality.tier === "off") return;

    let experience: Experience | undefined;
    let cancelled = false;

    const start = async () => {
      try {
        const { Experience } = await import("../../experience/Experience");
        if (cancelled) return;
        const instance = await Experience.create(container, quality);
        if (cancelled) {
          instance.dispose();
          return;
        }
        experience = instance;
        document.documentElement.dataset[LIVE_ATTRIBUTE] = "live";
      } catch (error) {
        // sem WebGPU nem WebGL2: o fallback CSS continua lá, ninguém percebe
        console.warn("[experience] desativado:", error);
      }
    };

    // Safari antigo não tem requestIdleCallback
    const hasIdle = "requestIdleCallback" in window;
    const handle = hasIdle
      ? window.requestIdleCallback(() => void start(), { timeout: 2000 })
      : window.setTimeout(() => void start(), 300);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      delete document.documentElement.dataset[LIVE_ATTRIBUTE];
      experience?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx("fixed inset-0 -z-10 pointer-events-none", className)}
      aria-hidden="true"
    />
  );
};
