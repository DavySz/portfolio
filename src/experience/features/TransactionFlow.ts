import * as THREE from "three/webgpu";
import {
  Fn,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
  color,
  float,
  mix,
  sin,
  fract,
  floor,
  length,
  smoothstep,
  varyingProperty,
  hash,
  instanceIndex,
  positionLocal,
  mx_noise_float,
} from "three/tsl";
import type { Feature, FrameContext } from "../types";

/**
 * Cena da seção "Minha Expertise": milhares de partículas que entram caóticas
 * e se organizam em faixas de fluxo conforme a seção sobe na tela.
 *
 * A leitura, sem ler nada: bagunça vira ordem.
 *
 * Toda a animação vive no positionNode (TSL), calculada a partir de
 * instanceIndex + uniforms. A CPU nunca escreve matriz de instância por frame:
 * as matrizes são identidade, gravadas uma única vez no construtor.
 * Sem compute shader, para o fallback WebGL2 ficar idêntico.
 */

/** Fundo da seção — é o mesmo `bg-secondary-50` que o CSS pinta hoje. */
const SURFACE = 0xf6f3fc;

/**
 * Teto de escurecimento das partículas: mix(SURFACE, primary-500, 0.30).
 *
 * É a COR delas, não um alpha. Com blend normal, N partículas sobrepostas
 * saturam na cor — então fixá-la aqui garante que o fundo composto nunca fica
 * mais escuro que isto, por mais densa que a cena esteja. Sobre este tom o
 * texto da seção mantém AA: descrição 6.13:1, tabela 4.99:1.
 *
 * O título é a exceção (3.30:1, porque o gradiente dele termina em
 * primary-500) — por isso a máscara vertical abaixo zera as partículas na
 * faixa onde ele vive.
 */
const PARTICLE = 0xd1bff3;

/** Faixa do topo sem partículas, em fração da altura da seção. */
const CLEAR_BAND_START = 0.3;
const CLEAR_BAND_END = 0.55;

const LANES = 14;

const COUNT = { high: 7000, low: 1500 } as const;

export class TransactionFlow implements Feature {
  readonly section = "services";
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  private readonly uTime = uniform(0);
  private readonly uOrganize = uniform(0);
  private readonly uVisibility = uniform(0);
  private readonly uAspect = uniform(1);

  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.MeshBasicNodeMaterial;
  private readonly particles: THREE.InstancedMesh;

  private readonly surfaceGeometry = new THREE.PlaneGeometry(2, 2);
  private readonly surfaceMaterial: THREE.MeshBasicNodeMaterial;
  private readonly surface: THREE.Mesh;

  private readonly animate: boolean;
  private organize = 0;

  constructor(quality: FrameContext["quality"]) {
    this.animate = quality.animate;
    const count = quality.tier === "high" ? COUNT.high : COUNT.low;

    // Fundo chapado: o canvas assume a cor que o CSS pintava, para a troca
    // entre fallback e cena ser invisível.
    //
    // Alpha 1, não uVisibility: o scissor já recorta a parte da seção que está
    // na tela, e essa parte precisa ser opaca. Com alpha proporcional à
    // visibilidade, o branco da página apareceria através da seção enquanto
    // ela entra. O fade por visibility vale para as partículas, não pro fundo.
    this.surfaceMaterial = new THREE.MeshBasicNodeMaterial();
    this.surfaceMaterial.colorNode = vec4(color(SURFACE), 1);
    this.surfaceMaterial.transparent = true;
    this.surfaceMaterial.depthWrite = false;
    this.surfaceMaterial.depthTest = false;

    this.surface = new THREE.Mesh(this.surfaceGeometry, this.surfaceMaterial);
    this.surface.frustumCulled = false;
    this.surface.renderOrder = 0;
    this.scene.add(this.surface);

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicNodeMaterial();
    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.depthTest = false;

    const { positionNode, colorNode } = this.buildNodes();
    this.material.positionNode = positionNode;
    this.material.colorNode = colorNode;

    this.particles = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      count
    );
    this.particles.frustumCulled = false;
    this.particles.renderOrder = 1;

    // Matrizes de instância: identidade, uma vez só. Quem posiciona é o shader.
    const identity = new THREE.Matrix4();
    for (let index = 0; index < count; index++) {
      this.particles.setMatrixAt(index, identity);
    }
    this.particles.instanceMatrix.needsUpdate = true;
    this.particles.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    this.scene.add(this.particles);
  }

  /**
   * Os dois nodes são construídos juntos porque compartilham o varying da
   * máscara: ela depende da posição, calculada no vertex, e é consumida no
   * fragment. Recalculá-la lá custaria um noise por fragmento.
   */
  private buildNodes() {
    const { uTime, uOrganize, uAspect, uVisibility } = this;
    // varyingProperty é a API de varying que se ATRIBUI no vertex e se lê
    // no fragment — mesmo padrão que o three usa em Instance.js/Batch.js.
    const mask = varyingProperty("float", "vMask");

    const positionNode = Fn(() => {
      const index = float(instanceIndex);

      // identidade estável da partícula — nada disso vem de buffer
      const r1 = hash(index);
      const r2 = hash(index.add(1.37));
      const r3 = hash(index.add(7.91));

      const organize = uOrganize;

      // --- estado caótico: vagueio com noise, sem direção
      const drift = vec3(r1.mul(40), r2.mul(40), uTime.mul(0.22));
      const chaosX = mx_noise_float(drift).mul(1.1);
      const chaosY = mx_noise_float(drift.add(vec3(19.7, 4.3, 0))).mul(0.92);

      // --- estado organizado: faixas horizontais, velocidade constante
      const lane = floor(r3.mul(LANES));
      const laneY = lane.div(LANES - 1).sub(0.5).mul(1.62);
      const speed = r1.mul(0.3).add(0.18);
      // fract dá o wrap: a partícula reaparece na borda oposta
      const flowX = fract(r2.add(uTime.mul(speed))).mul(2.4).sub(1.2);
      // ondulação leve para a faixa não virar régua
      const wobble = sin(flowX.mul(2.4).add(r2.mul(6.28318))).mul(0.03);
      const flowY = laneY.add(wobble);

      const x = mix(chaosX, flowX, organize);
      const y = mix(chaosY, flowY, organize);

      // Máscara: apaga as partículas na faixa do título, onde o gradiente
      // chega a primary-500 e não sobra contraste. 0 = topo da seção.
      const fromTop = float(1).sub(y).mul(0.5);
      mask.assign(smoothstep(CLEAR_BAND_START, CLEAR_BAND_END, fromTop));

      // organizadas viram traço: esticam no eixo do movimento
      const stretch = mix(float(1), float(3.4), organize);
      const scale = vec3(float(0.016).mul(stretch), float(0.016), 1);

      return vec3(x.mul(uAspect), y, 0).add(positionLocal.mul(scale));
    })();

    const colorNode = Fn(() => {
      // recorte redondo e suave dentro do quad
      const radius = length(uv().sub(vec2(0.5))).mul(2);
      const soft = smoothstep(float(1), float(0.25), radius);

      return vec4(color(PARTICLE), soft.mul(mask).mul(uVisibility));
    })();

    return { positionNode, colorNode };
  }

  resize({ width, height }: FrameContext) {
    const aspect = width / Math.max(height, 1);
    this.uAspect.value = aspect;

    // O shader posiciona em x * aspect, então o frustum precisa abrir junto;
    // com -1..1 fixo as partículas das bordas seriam cortadas.
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.top = 1;
    this.camera.bottom = -1;
    this.camera.updateProjectionMatrix();

    // o quad de fundo tem 2 unidades de largura: precisa esticar com o frustum
    this.surface.scale.x = aspect;
  }

  update({ progress, visibility }: FrameContext, delta: number) {
    this.uVisibility.value = visibility;

    if (!this.animate) {
      // reduced motion: cena congelada no estado organizado
      this.uOrganize.value = 1;
      this.uTime.value = 0;
      return;
    }

    this.uTime.value += delta;

    // A organização completa antes da seção chegar ao meio da tela, e fica.
    const target = smoothstepScalar(0.15, 0.55, progress);
    const k = 1 - Math.exp(-delta * 3);
    this.organize += (target - this.organize) * k;
    this.uOrganize.value = this.organize;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.surfaceGeometry.dispose();
    this.surfaceMaterial.dispose();
    this.particles.dispose();
    this.scene.clear();
  }
}

const smoothstepScalar = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};
