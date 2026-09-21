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
  /**
   * Desmontar a sessão anterior leva 450ms (a animação de volta). Ligar de
   * novo antes disso fazia a sessão velha apagar os estilos que a nova tinha
   * acabado de escrever, e a página ficava "ativa" sem cair. Esta promessa
   * encadeia as sessões: a nova só começa quando a anterior terminou.
   */
  const teardownRef = useRef<Promise<void>>(Promise.resolve());

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
      await teardownRef.current;
      if (cancelled) return;

      // O Rapier entra aqui e só aqui: quem nunca ativa não baixa o WASM.
      const { startGravity } = await import("../../physics/gravity-world");
      if (cancelled) return;

      const world = await startGravity();
      if (cancelled) {
        await world?.dispose();
        return;
      }

      // Nada visível para derrubar: desliga em vez de ficar num estado ativo
      // que não faz nada e ainda prende o scroll.
      if (!world) {
        setGravityActive(false);
        return;
      }

      worldRef.current = world;
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

      teardownRef.current = (world?.dispose() ?? Promise.resolve()).then(() => {
        restoreFocusRef.current?.focus();
        restoreFocusRef.current = null;
      });
    };
  }, [active]);

  return null;
};
