import * as THREE from "three/webgpu";
import {
  Fn,
  uniform,
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
 * Cena da seção "Quem sou eu": placas finas empilhadas, levemente
 * desalinhadas, girando devagar.
 *
 * A leitura é a da própria seção — camadas separadas por baixo, uma superfície
 * só por cima. É de propósito o oposto do hero: lá os anéis se abrem e se
 * fecham; aqui nada acontece de repente. A seção estava com uma ilustração
 * genérica roxa que repetia a cor do hero e pesava a página; esta cena ocupa o
 * mesmo lugar sem competir com o texto ao lado.
 */

/** Espelham tokens do tailwind.config.js: primary-100, primary-400, primary-700. */
const LIGHT = 0xe9e3ff;
const MID = 0x9573d7;
const DEEP = 0x5a2db8;

const CAMERA_FOV = 32;
const CAMERA_DISTANCE = 7;

/** Abaixo disso a seção empilha e a cena passaria atrás do texto. */
const MIN_WIDTH = 1024;

/** Fração da meia-largura usada para centralizar a cena na coluna da imagem. */
const HORIZONTAL_OFFSET = -0.4;
/** Altura da pilha como fração da altura da seção. */
const HEIGHT_RATIO = 0.62;

interface PlateConfig {
  /** largura e profundidade, em unidades de mundo */
  size: number;
  /** deslocamento no eixo Y, do topo da pilha para a base */
  y: number;
  /** quanto a placa escorrega para o lado, para a pilha não virar um bloco */
  offsetX: number;
  offsetZ: number;
}

const PLATES: PlateConfig[] = [
  { size: 1.5, y: 0.52, offsetX: 0.1, offsetZ: -0.06 },
  { size: 1.66, y: 0.26, offsetX: -0.06, offsetZ: 0.08 },
  { size: 1.82, y: 0.0, offsetX: 0.04, offsetZ: -0.04 },
  { size: 1.98, y: -0.26, offsetX: -0.1, offsetZ: 0.05 },
  { size: 2.14, y: -0.52, offsetX: 0.02, offsetZ: 0.0 },
];

const THICKNESS = 0.05;

export class LayeredStack implements Feature {
  readonly section = "self";
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    1,
    0.1,
    CAMERA_DISTANCE * 4
  );

  private readonly group = new THREE.Group();
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly material: THREE.MeshBasicNodeMaterial;
  private readonly uSpread = uniform(0);

  private readonly animate: boolean;
  private elapsed = 0;

  constructor(quality: FrameContext["quality"]) {
    this.animate = quality.animate;

    this.material = new THREE.MeshBasicNodeMaterial();
    this.material.colorNode = this.buildColorNode();

    for (const plate of PLATES) {
      const geometry = new THREE.BoxGeometry(
        plate.size,
        THICKNESS,
        plate.size * 0.62
      );
      this.geometries.push(geometry);

      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.position.set(plate.offsetX, plate.y, plate.offsetZ);
      this.group.add(mesh);
    }

    // 3/4 de cima: é o ângulo em que a separação entre as camadas se lê
    this.group.rotation.set(-0.42, 0.62, 0);
    this.scene.add(this.group);
    this.camera.position.z = CAMERA_DISTANCE;
  }

  /** Iluminação falsa: sem luzes, sem sombras, sem textura. */
  private buildColorNode() {
    const { uSpread } = this;

    return Fn(() => {
      const normal = normalize(normalView);

      const facing = saturate(dot(normal, positionViewDirection));
      const rim = pow(facing.oneMinus(), 2.4);

      const key = dot(normal, normalize(vec3(0.3, 0.8, 0.5)))
        .mul(0.5)
        .add(0.5);

      const base = mix(color(DEEP), color(MID), smoothstep(0.2, 0.95, key));

      // A borda acende um pouco mais quando a pilha se abre: o movimento fica
      // legível sem precisar ser rápido.
      const glow = rim.mul(uSpread.mul(0.25).add(0.3));
      return vec4(base.add(color(LIGHT).mul(glow)), 1);
    })();
  }

  resize({ width, height }: FrameContext) {
    const safeHeight = Math.max(height, 1);
    const aspect = width / safeHeight;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.group.visible = width >= MIN_WIDTH;
    if (!this.group.visible) return;

    const halfHeight =
      CAMERA_DISTANCE * Math.tan((CAMERA_FOV * Math.PI) / 360);
    const halfWidth = halfHeight * aspect;

    this.group.scale.setScalar(halfHeight * HEIGHT_RATIO);
    this.group.position.x = halfWidth * HORIZONTAL_OFFSET;
  }

  update({ progress }: FrameContext, delta: number) {
    if (!this.group.visible) return;

    if (!this.animate) {
      // pose estática: a pilha meio aberta, que é onde as camadas se leem
      this.uSpread.value = 0.5;
      this.applySpread(0.5);
      return;
    }

    this.elapsed += delta;

    // A pilha se abre conforme a seção sobe e respira devagar depois disso.
    const scrolled = smoothstepScalar(0.1, 0.5, progress);
    const breath = 0.5 + 0.5 * Math.sin(this.elapsed * 0.35);
    const spread = scrolled * (0.6 + breath * 0.4);

    this.uSpread.value = spread;
    this.applySpread(spread);

    this.group.rotation.y = 0.62 + Math.sin(this.elapsed * 0.18) * 0.16;
  }

  /** Afasta as placas na vertical e acentua o deslize lateral. */
  private applySpread(spread: number) {
    this.group.children.forEach((child, index) => {
      const plate = PLATES[index];
      if (!plate) return;
      child.position.y = plate.y * (1 + spread * 0.55);
      child.position.x = plate.offsetX * (1 + spread * 1.6);
      child.position.z = plate.offsetZ * (1 + spread * 1.6);
    });
  }

  dispose() {
    for (const geometry of this.geometries) geometry.dispose();
    this.geometries.length = 0;
    this.material.dispose();
    this.group.clear();
    this.scene.clear();
  }
}

const smoothstepScalar = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};
