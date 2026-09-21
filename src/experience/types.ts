import type * as THREE from "three/webgpu";
import type { Quality } from "./quality";

export interface FrameContext {
  /** ponteiro normalizado no container: (0,0) canto inferior esquerdo, (1,1) superior direito */
  pointer: THREE.Vector2;
  width: number;
  height: number;
  quality: Quality;
}

/**
 * Cada efeito (fundo do hero, objeto-assinatura, cena de domínio…) é uma Feature.
 * O Experience renderiza as features em ordem, sem limpar entre elas,
 * então dá pra empilhar camadas (ex.: fundo + objeto 3D) num único canvas.
 */
export interface Feature {
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;
  resize(ctx: FrameContext): void;
  update(ctx: FrameContext, delta: number): void;
  dispose(): void;
}
