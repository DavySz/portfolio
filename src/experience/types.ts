import type * as THREE from "three/webgpu";
import type { Quality } from "./quality";

export interface FrameContext {
  /** ponteiro normalizado na SEÇÃO da feature: (0,0) canto inferior esquerdo */
  pointer: THREE.Vector2;
  /** dimensões da seção da feature, não da viewport */
  width: number;
  height: number;
  /** 0 quando a seção entra por baixo, 1 quando sai por cima */
  progress: number;
  /** 0–1, fração da seção visível na viewport */
  visibility: number;
  quality: Quality;
}

/**
 * Cada efeito (fundo do hero, objeto-assinatura, cena de domínio…) é uma Feature.
 * `section` diz a qual seção registrada ela pertence: o Experience recorta o
 * render ao retângulo dessa seção e só a atualiza enquanto ela estiver visível.
 */
export interface Feature {
  readonly section: string;
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;
  resize(ctx: FrameContext): void;
  update(ctx: FrameContext, delta: number): void;
  dispose(): void;
  /**
   * Opcional: só as features cujo material depende do tema da página
   * implementam. O canvas é decoração (`aria-hidden`), então o que está em
   * jogo aqui não é contraste de texto — é o objeto continuar se lendo como
   * objeto sobre o fundo novo.
   */
  setTheme?(theme: "light" | "dark"): void;
}
