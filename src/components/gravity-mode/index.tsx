import { useEffect, useRef } from "react";
import {
  isGravityAvailable,
  listenForKonami,
  setGravityActive,
} from "../../physics/gravity-mode";
import { useGravityMode } from "../../hooks/useGravityMode/use-gravity-mode";
import type { GravityWorld } from "../../physics/gravity-world";

/**
 * Orquestra o easter egg: escuta o Konami e carrega a física só na ativação.
 *
 * Não desenha nada. O controle de ligar e desligar é um só, o link do rodapé,
 * que não cai junto e flutua enquanto o modo está ativo — ter um segundo botão
 * "arrumar a página" com outro texto dizia duas coisas para a mesma ação.
 */
export const GravityMode: React.FC = () => {
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

  return null;
};
