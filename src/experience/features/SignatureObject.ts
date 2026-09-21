import * as THREE from "three/webgpu";
import {
  Fn,
  vec3,
  vec4,
  color,
  mix,
  dot,
  pow,
  saturate,
  smoothstep,
  normalize,
  normalView,
  positionViewDirection,
} from "three/tsl";
import type { Feature, FrameContext } from "../types";

/**
 * Objeto-assinatura: anéis concêntricos girando em eixos diferentes que
 * convergem para um plano único.
 *
 * A leitura: por baixo há estado assíncrono, retry e reconciliação; o usuário
 * só pode ver o alinhamento. Aproximar o ponteiro do objeto o faz assentar.
 *
 * Versão procedural — a task 02 deixou `loadModel` pronto, então trocar por um
 * .glb do Blender depois é só substituir a criação das TorusGeometry no
 * construtor pela malha carregada; o resto (pose, tiers, dispose) não muda.
 */

/** Espelham tokens do tailwind.config.js: primary-900, primary-500, primary-200. */
const DEEP = 0x311961;
const BRAND = 0x7947df;
const RIM = 0xd4c7ff;

const CAMERA_FOV = 35;
const CAMERA_DISTANCE = 7;

/** Abaixo disso o hero empilha (flex-col-reverse) e a foto cobre o topo:
 *  não há área livre sem passar atrás do texto, então o objeto some.
 *  1280px é o breakpoint `xl` do Tailwind, onde o hero vira linha. */
const MIN_WIDTH = 1280;

/** Fração da meia-largura usada para centralizar o objeto sobre a foto. */
const HORIZONTAL_OFFSET = 0.33;
/** Diâmetro do anel externo como fração da altura do hero (halo em volta da foto). */
const DIAMETER_RATIO = 1.25;

interface RingConfig {
  radius: number;
  tube: number;
  /** eixo de inclinação: precisa estar NO plano do anel, senão o giro é invisível */
  axis: "x" | "y";
  /** inclinação máxima, em radianos, quando o objeto está totalmente aberto */
  tilt: number;
}

const RINGS: RingConfig[] = [
  { radius: 1.0, tube: 0.03, axis: "x", tilt: 1.15 },
  { radius: 0.78, tube: 0.026, axis: "y", tilt: -0.95 },
  { radius: 0.58, tube: 0.022, axis: "x", tilt: 0.7 },
  { radius: 0.38, tube: 0.018, axis: "y", tilt: -0.48 },
];

export class SignatureObject implements Feature {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    1,
    0.1,
    CAMERA_DISTANCE * 4
  );

  private readonly group = new THREE.Group();
  private readonly rings: THREE.Mesh[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly material: THREE.MeshBasicNodeMaterial;
  private readonly ringConfigs: RingConfig[];

  /** 0 = anéis alinhados num plano só; 1 = totalmente abertos. */
  private disarray = 0;
  private yaw = 0;
  private pitch = 0;
  private elapsed = 0;

  constructor(quality: FrameContext["quality"]) {
    const isHigh = quality.tier === "high";
    this.ringConfigs = isHigh ? RINGS : RINGS.slice(0, 3);

    this.material = new THREE.MeshBasicNodeMaterial();
    this.material.colorNode = this.buildColorNode();

    const radialSegments = isHigh ? 10 : 8;
    const tubularSegments = isHigh ? 96 : 64;

    for (const config of this.ringConfigs) {
      const geometry = new THREE.TorusGeometry(
        config.radius,
        config.tube,
        radialSegments,
        tubularSegments
      );
      this.geometries.push(geometry);

      const mesh = new THREE.Mesh(geometry, this.material);
      this.rings.push(mesh);
      this.group.add(mesh);
    }

    const core = new THREE.IcosahedronGeometry(0.09, isHigh ? 1 : 0);
    this.geometries.push(core);
    this.group.add(new THREE.Mesh(core, this.material));

    // pose base: leve 3/4, pra "alinhado" não virar um disco chapado de frente
    this.group.rotation.set(-0.3, 0.38, 0.12);
    this.scene.add(this.group);

    this.camera.position.z = CAMERA_DISTANCE;

    this.applyPose();
  }

  /** Iluminação falsa em shader: sem luzes, sem sombras, sem textura de matcap. */
  private buildColorNode() {
    return Fn(() => {
      const normal = normalize(normalView);

      // rim light: acende a silhueta onde a normal foge da câmera
      const facing = saturate(dot(normal, positionViewDirection));
      const rim = pow(facing.oneMinus(), 2.2);

      // "key light" fixa em view space — acompanha a câmera, então nunca escurece tudo
      const key = dot(normal, normalize(vec3(0.35, 0.75, 0.55)))
        .mul(0.5)
        .add(0.5);

      const base = mix(color(DEEP), color(BRAND), smoothstep(0.15, 0.95, key));

      return vec4(base.add(color(RIM).mul(rim).mul(0.9)), 1);
    })();
  }

  /** Escreve `disarray`, `yaw` e `pitch` nas transformações. */
  private applyPose() {
    this.ringConfigs.forEach((config, index) => {
      const angle = config.tilt * this.disarray;
      const ring = this.rings[index];
      ring.rotation.set(0, 0, 0);
      if (config.axis === "x") ring.rotation.x = angle;
      else ring.rotation.y = angle;
    });

    this.group.rotation.x = -0.3 + this.pitch;
    this.group.rotation.y = 0.38 + this.yaw;
  }

  resize({ width, height }: FrameContext) {
    const safeHeight = Math.max(height, 1);
    const aspect = width / safeHeight;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    // Some quando o hero empilha: não há área livre longe do texto.
    this.group.visible = width >= MIN_WIDTH;
    if (!this.group.visible) return;

    const halfHeight =
      CAMERA_DISTANCE * Math.tan((CAMERA_FOV * Math.PI) / 360);
    const halfWidth = halfHeight * aspect;

    // anel externo tem raio 1 antes da escala
    this.group.scale.setScalar(halfHeight * DIAMETER_RATIO);
    this.group.position.x = halfWidth * HORIZONTAL_OFFSET;
  }

  update({ pointer, quality }: FrameContext, delta: number) {
    if (!this.group.visible) return;

    if (!quality.animate) {
      // pose estática: anéis alinhados, que é o estado "assentado"
      this.disarray = 0;
      this.yaw = 0;
      this.pitch = 0;
      this.applyPose();
      return;
    }

    this.elapsed += delta;

    // respiração lenta: garante movimento sem ponteiro (toque e tier low)
    const idle = 0.28 + 0.16 * Math.sin(this.elapsed * 0.25);

    let targetDisarray = idle;
    let targetYaw = 0;
    let targetPitch = 0;

    if (quality.tier === "high") {
      // quanto mais longe do centro o ponteiro estiver, mais os anéis abrem;
      // trazer o cursor até o objeto faz ele assentar
      const dx = pointer.x - 0.5;
      const dy = pointer.y - 0.5;
      const distance = Math.min(Math.hypot(dx, dy) * 2.2, 1);

      targetDisarray = Math.min(idle + distance * 0.72, 1);
      targetYaw = dx * 0.5;
      targetPitch = -dy * 0.32;
    }

    // amortecimento independente de framerate — mesmo padrão do HeroBackground
    const k = 1 - Math.exp(-delta * 2.4);
    this.disarray += (targetDisarray - this.disarray) * k;
    this.yaw += (targetYaw - this.yaw) * k;
    this.pitch += (targetPitch - this.pitch) * k;

    this.applyPose();
  }

  dispose() {
    for (const geometry of this.geometries) geometry.dispose();
    this.geometries.length = 0;
    this.rings.length = 0;
    this.material.dispose();
    this.group.clear();
    this.scene.clear();
  }
}
