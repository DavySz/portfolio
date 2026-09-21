import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  isGravityAvailable,
  listenForKonami,
  setGravityActive,
} from "../../physics/gravity-mode";
import { useGravityMode } from "../../hooks/useGravityMode/use-gravity-mode";
import type { GravityWorld } from "../../physics/gravity-world";

/**
 * Orquestra o easter egg: escuta o Konami, carrega a física só na ativação e
 * oferece a saída por Esc ou pelo botão flutuante.
 *
 * Fica no PageTemplate e não renderiza nada enquanto o modo está desligado.
 */
export const GravityMode: React.FC = () => {
  const { t } = useTranslation("component");
  const { active } = useGravityMode();
  const worldRef = useRef<GravityWorld | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isGravityAvailable()) return;
    return listenForKonami(() => setGravityActive(true));
  }, []);

  useEffect(() => {
    if (!active) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    let cancelled = false;

    const start = async () => {
      // O Rapier entra aqui e só aqui: quem nunca ativa não baixa o WASM.
      const { startGravity } = await import("../../physics/gravity-world");
      if (cancelled) return;
      worldRef.current = await startGravity();
    };

    void start();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGravityActive(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKeyDown);

      const world = worldRef.current;
      worldRef.current = null;
      void world?.dispose().then(() => {
        restoreFocusRef.current?.focus();
        restoreFocusRef.current = null;
      });
    };
  }, [active]);

  if (!active) return null;

  return (
    <button
      type="button"
      onClick={() => setGravityActive(false)}
      data-no-physics
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl bg-gradient-to-r from-primary-500 to-primary-900
                 px-8 py-3 font-poppins font-semibold text-white shadow-primary
                 transition-transform duration-300 hover:scale-105 active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
    >
      {t("gravity.restore")}
    </button>
  );
};
