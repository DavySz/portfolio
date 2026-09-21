import * as THREE from "three/webgpu";
import type { Quality } from "./quality";
import type { Feature, FrameContext } from "./types";
import { HeroBackground } from "./features/HeroBackground";
import { SignatureObject } from "./features/SignatureObject";

/**
 * Núcleo imperativo: um renderer, um loop, N features.
 * O React só monta/desmonta; nada aqui depende de re-render.
 */
export class Experience {
  private readonly renderer: THREE.WebGPURenderer;
  private readonly features: Feature[] = [];
  private readonly ctx: FrameContext;
  private readonly cleanups: Array<() => void> = [];
  private visible = true;
  private lastTime = 0;

  static async create(container: HTMLElement, quality: Quality) {
    const experience = new Experience(container, quality);
    await experience.init();
    return experience;
  }

  private constructor(
    private readonly container: HTMLElement,
    quality: Quality
  ) {
    // WebGPURenderer cai sozinho pra WebGL2 quando o navegador não tem WebGPU
    this.renderer = new THREE.WebGPURenderer({
      antialias: false,
      powerPreference: "high-performance",
    });
    this.ctx = {
      pointer: new THREE.Vector2(0.5, 0.5),
      width: 1,
      height: 1,
      quality,
    };
  }

  private async init() {
    const { renderer, container, ctx } = this;
    await renderer.init();

    renderer.setPixelRatio(ctx.quality.pixelRatio);
    renderer.autoClear = false;

    const canvas = renderer.domElement;
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      opacity: "0",
      transition: "opacity 900ms ease",
    });
    container.appendChild(canvas);

    // Dimensiona antes do primeiro frame: o ResizeObserver só dispara no próximo
    // tick, e sem isso o frame inicial sairia no tamanho padrão do canvas.
    this.syncSize(container.clientWidth, container.clientHeight);

    // ordem = ordem de composição: o fundo não escreve depth, então o
    // objeto renderiza por cima dele no mesmo canvas e no mesmo loop.
    this.add(new HeroBackground());
    this.add(new SignatureObject(ctx.quality));

    this.observeSize();
    this.observeVisibility();
    if (ctx.quality.animate) this.observePointer();

    this.renderFrame(0);
    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    if (ctx.quality.animate) renderer.setAnimationLoop(this.tick);
  }

  add(feature: Feature) {
    this.features.push(feature);
    feature.resize(this.ctx);
  }

  private tick = (now: number) => {
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    if (!this.visible) return; // fora da tela: não gasta GPU
    this.renderFrame(delta);
  };

  private renderFrame(delta: number) {
    const { renderer, ctx } = this;
    renderer.clear();
    for (const feature of this.features) {
      feature.update(ctx, delta);
      renderer.render(feature.scene, feature.camera);
    }
  }

  private syncSize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.ctx.width = width;
    this.ctx.height = height;
    this.renderer.setSize(width, height, false);
    for (const feature of this.features) feature.resize(this.ctx);
  }

  private observeSize() {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      this.syncSize(width, height);
      if (!this.ctx.quality.animate) this.renderFrame(0);
    });
    observer.observe(this.container);
    this.cleanups.push(() => observer.disconnect());
  }

  private observeVisibility() {
    const observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
    });
    observer.observe(this.container);
    this.cleanups.push(() => observer.disconnect());
  }

  private observePointer() {
    const onMove = (event: PointerEvent) => {
      const rect = this.container.getBoundingClientRect();
      this.ctx.pointer.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    this.cleanups.push(() =>
      window.removeEventListener("pointermove", onMove)
    );
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.cleanups.forEach((fn) => fn());
    this.features.forEach((feature) => feature.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
