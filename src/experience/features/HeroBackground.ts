import * as THREE from "three/webgpu";
import {
  Fn,
  uniform,
  uv,
  time,
  vec2,
  vec3,
  vec4,
  color,
  mix,
  smoothstep,
  distance,
  hash,
  screenUV,
  mx_noise_float,
} from "three/tsl";
import type { Feature, FrameContext } from "../types";

/**
 * Cores do gradiente. BRAND espelha `primary-500` (#7947DF) do tailwind.config.js —
 * o shader precisa do valor numérico, então é o único lugar do experience que
 * repete o hex da marca. Se o token do tema mudar, mudar aqui também.
 */
const DEEP = 0x0e0a1a;
const MID = 0x2a1760;
const BRAND = 0x7947df;

/**
 * Fase 1: gradiente vivo em TSL na paleta do site.
 * Um plano 2x2 com câmera ortográfica = quad fullscreen. Zero modelos, zero física.
 * TSL compila para WGSL (WebGPU) ou GLSL (fallback WebGL2) automaticamente.
 */
export class HeroBackground implements Feature {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  private readonly uPointer = uniform(new THREE.Vector2(0.5, 0.5));
  private readonly uAspect = uniform(1);
  private readonly mesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicNodeMaterial
  >;

  constructor() {
    const material = new THREE.MeshBasicNodeMaterial();
    material.colorNode = this.buildColorNode();

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  private buildColorNode() {
    const { uPointer, uAspect } = this;

    return Fn(() => {
      // corrige o aspect pra o noise não esticar em telas largas
      const st = vec2(uv().x.mul(uAspect), uv().y);
      const t = time.mul(0.04);

      // domain warping: um noise deforma as coordenadas do outro → aspecto de fluido
      const warp = mx_noise_float(vec3(st.mul(1.1), t));
      const n = mx_noise_float(
        vec3(st.mul(2.0).add(warp.mul(0.9)), t.mul(1.5))
      );

      const deep = color(DEEP);
      const mid = color(MID);
      const brand = color(BRAND);

      const base = mix(deep, mid, smoothstep(-0.4, 0.6, n));
      const lit = mix(base, brand, smoothstep(0.35, 0.9, n).mul(0.5));

      // brilho sutil seguindo o cursor
      const pointer = vec2(uPointer.x.mul(uAspect), uPointer.y);
      const glow = smoothstep(0.0, 0.6, distance(st, pointer))
        .oneMinus()
        .mul(0.12);

      // dithering: evita banding em gradientes escuros (fica feio em monitor 8-bit)
      const grain = hash(screenUV.mul(4096))
        .sub(0.5)
        .mul(1 / 255);

      return vec4(lit.add(brand.mul(glow)).add(grain), 1);
    })();
  }

  resize({ width, height }: FrameContext) {
    this.uAspect.value = width / Math.max(height, 1);
  }

  update({ pointer }: FrameContext, delta: number) {
    // suaviza o ponteiro independente do framerate
    const k = 1 - Math.exp(-delta * 3);
    this.uPointer.value.lerp(pointer, k);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
