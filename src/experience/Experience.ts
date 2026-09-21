import * as THREE from "three/webgpu";
import type { Quality } from "./quality";
import type { Feature, FrameContext } from "./types";
import { getSections, subscribeSections } from "./sections";
import { HeroBackground } from "./features/HeroBackground";
import { SignatureObject } from "./features/SignatureObject";
import { TransactionFlow } from "./features/TransactionFlow";

/**
 * Núcleo imperativo: UM canvas fixo atrás da página inteira, um loop, N features.
 * Cada feature pertence a uma seção registrada; o render é recortado ao
 * retângulo dessa seção, então o canvas global se comporta como se cada cena
 * vivesse dentro da sua própria seção.
 *
 * O React só monta/desmonta; nada aqui depende de re-render.
 */

interface SectionFrame {
  /** posição no documento — só muda em resize/relayout, não em scroll */
  docTop: number;
  docLeft: number;
  width: number;
  height: number;
  /** recalculados a cada frame a partir do scroll */
  screenTop: number;
  screenLeft: number;
  progress: number;
  visibility: number;
}

export class Experience {
  private readonly renderer: THREE.WebGPURenderer;
  private readonly features: Feature[] = [];
  private readonly ctx: FrameContext;
  private readonly cleanups: Array<() => void> = [];
  private readonly sections = new Map<string, SectionFrame>();

  /** posição do ponteiro em px da viewport; -1 = ainda não houve ponteiro */
  private pointerX = -1;
  private pointerY = -1;

  private viewportWidth = 1;
  private viewportHeight = 1;
  private lastTime = 0;
  /** há pixels de um frame anterior no canvas? */
  private painted = false;
  /** usado no tier animate:false para só repintar quando o scroll muda */
  private lastScrollY = Number.NaN;

  static async create(container: HTMLElement, quality: Quality) {
    const experience = new Experience(container, quality);
    await experience.init();
    return experience;
  }

  private constructor(
    private readonly container: HTMLElement,
    quality: Quality
  ) {
    // WebGPURenderer cai sozinho pra WebGL2 quando o navegador não tem WebGPU.
    // alpha: o canvas é global, então fora dos retângulos das seções ele
    // precisa ser transparente — senão cobriria a página inteira.
    this.renderer = new THREE.WebGPURenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.ctx = {
      pointer: new THREE.Vector2(0.5, 0.5),
      width: 1,
      height: 1,
      progress: 0,
      visibility: 0,
      quality,
    };
  }

  private async init() {
    const { renderer, container, ctx } = this;
    await renderer.init();

    renderer.setPixelRatio(ctx.quality.pixelRatio);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });
    container.appendChild(canvas);

    // Dimensiona antes do primeiro frame: o ResizeObserver só dispara no
    // próximo tick, e sem isso o frame inicial sairia no tamanho padrão.
    this.syncViewport(container.clientWidth, container.clientHeight);
    this.measureSections();

    this.add(new HeroBackground());
    this.add(new SignatureObject(ctx.quality));
    this.add(new TransactionFlow(ctx.quality));

    this.observeViewport();
    this.observeLayout();
    this.observeSectionRegistry();
    if (ctx.quality.animate) this.observePointer();

    this.renderFrame(0);
    renderer.setAnimationLoop(this.tick);
  }

  add(feature: Feature) {
    this.features.push(feature);
    this.resizeFeature(feature);
  }

  // ---------------------------------------------------------------- seções

  /** Lê os rects do DOM. Caro, então só roda em resize/relayout/registro. */
  private measureSections() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    this.sections.clear();
    for (const [id, element] of getSections()) {
      const rect = element.getBoundingClientRect();
      this.sections.set(id, {
        docTop: rect.top + scrollY,
        docLeft: rect.left + scrollX,
        width: rect.width,
        height: rect.height,
        screenTop: rect.top,
        screenLeft: rect.left,
        progress: 0,
        visibility: 0,
      });
    }

    this.updateSectionState();
  }

  /** Roda a cada frame: só aritmética, nenhum acesso ao layout do DOM. */
  private updateSectionState() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const viewport = this.viewportHeight;

    for (const section of this.sections.values()) {
      section.screenTop = section.docTop - scrollY;
      section.screenLeft = section.docLeft - scrollX;

      const top = section.screenTop;
      const bottom = top + section.height;

      const overlap = Math.min(bottom, viewport) - Math.max(top, 0);
      const span = Math.min(section.height, viewport) || 1;
      section.visibility = Math.min(Math.max(overlap / span, 0), 1);

      const travel = viewport + section.height || 1;
      section.progress = Math.min(Math.max((viewport - top) / travel, 0), 1);
    }
  }

  /** Aponta o ctx compartilhado para uma seção antes de chamar a feature. */
  private applySectionContext(section: SectionFrame) {
    const { ctx } = this;
    ctx.width = section.width;
    ctx.height = section.height;
    ctx.progress = section.progress;
    ctx.visibility = section.visibility;

    if (this.pointerX < 0) {
      ctx.pointer.set(0.5, 0.5);
      return;
    }

    ctx.pointer.set(
      (this.pointerX - section.screenLeft) / (section.width || 1),
      1 - (this.pointerY - section.screenTop) / (section.height || 1)
    );
  }

  private resizeFeature(feature: Feature) {
    const section = this.sections.get(feature.section);
    if (!section) return;
    this.applySectionContext(section);
    feature.resize(this.ctx);
  }

  private resizeFeatures() {
    for (const feature of this.features) this.resizeFeature(feature);
  }

  // ----------------------------------------------------------------- loop

  private tick = (now: number) => {
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.ctx.quality.animate) {
      this.renderFrame(delta);
      return;
    }

    // reduced motion: nada anima, mas o canvas é fixo — se o scroll mudou, o
    // recorte da seção mudou de lugar e o frame estático precisa ser repintado.
    if (window.scrollY === this.lastScrollY) return;
    this.lastScrollY = window.scrollY;
    this.renderFrame(0);
  };

  private renderFrame(delta: number) {
    const { renderer } = this;
    this.updateSectionState();

    let drew = false;

    for (const feature of this.features) {
      const section = this.sections.get(feature.section);
      if (!section || section.visibility <= 0) continue;

      if (!drew) {
        // limpa o canvas inteiro antes da primeira cena do frame
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, this.viewportWidth, this.viewportHeight);
        renderer.clear();
        drew = true;
      }

      this.applySectionContext(section);

      // A API do three usa origem no TOPO-esquerda e cada backend adapta:
      // o WebGPU passa direto, o fallback WebGL converte com
      // `height - height - y`. Então `y` aqui é a distância do topo da tela,
      // não do rodapé — é exatamente o screenTop do rect do DOM.

      // viewport = retângulo inteiro da seção, mesmo a parte fora da tela,
      // para a cena não esticar conforme entra e sai
      renderer.setViewport(
        section.screenLeft,
        section.screenTop,
        section.width,
        section.height
      );

      // scissor = só o pedaço que está na tela
      const clipTop = Math.max(section.screenTop, 0);
      const clipBottom = Math.min(
        section.screenTop + section.height,
        this.viewportHeight
      );
      renderer.setScissor(
        section.screenLeft,
        clipTop,
        section.width,
        clipBottom - clipTop
      );
      renderer.setScissorTest(true);

      feature.update(this.ctx, delta);
      renderer.render(feature.scene, feature.camera);
    }

    renderer.setScissorTest(false);

    if (drew) {
      this.painted = true;
      return;
    }

    // Nenhuma seção visível: apaga os pixels do frame anterior uma vez e para.
    // Sem isso o canvas fixo continuaria mostrando a cena antiga por trás das
    // seções transparentes da página.
    if (this.painted) {
      renderer.setViewport(0, 0, this.viewportWidth, this.viewportHeight);
      renderer.clear();
      this.painted = false;
    }
  }

  // ------------------------------------------------------------ observers

  private syncViewport(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.renderer.setSize(width, height, false);
  }

  private observeViewport() {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      this.syncViewport(width, height);
      this.measureSections();
      this.resizeFeatures();
      this.lastScrollY = Number.NaN;
    });
    observer.observe(this.container);
    this.cleanups.push(() => observer.disconnect());
  }

  /** Seções lazy entrando mudam a altura do documento e empurram os rects. */
  private observeLayout() {
    const observer = new ResizeObserver(() => {
      this.measureSections();
      this.resizeFeatures();
      this.lastScrollY = Number.NaN;
    });
    observer.observe(document.body);
    this.cleanups.push(() => observer.disconnect());
  }

  private observeSectionRegistry() {
    this.cleanups.push(
      subscribeSections(() => {
        this.measureSections();
        this.resizeFeatures();
        this.lastScrollY = Number.NaN;
      })
    );
  }

  private observePointer() {
    const onMove = (event: PointerEvent) => {
      this.pointerX = event.clientX;
      this.pointerY = event.clientY;
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
    this.features.length = 0;
    this.sections.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
