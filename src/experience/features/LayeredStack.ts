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
 * Cena da seção "Quem sou eu": placas empilhadas e levemente desalinhadas,
 * girando devagar.
 *
 * A leitura é a da própria seção — camadas separadas por baixo, uma superfície
 * só por cima. É de propósito o oposto do hero: lá os anéis se abrem e fecham;
 * aqui nada acontece de repente.
 *
 * Duas coisas fazem isto parecer objeto e não recorte de papel, e as duas
 * faltavam na primeira versão:
 *
 * 1. **Arestas biseladas.** Caixa de canto vivo não tem onde a luz bater. O
 *    bisel cria uma faixa estreita que acende em cada quina — é o que faz
 *    render de produto parecer sólido.
 * 2. **Faixa de valor larga.** A primeira versão ia de primary-700 a
 *    primary-400: 0,16 de diferença de luminância entre sombra e luz. Aqui a
 *    sombra é quase primary-900 e o brilho é quase branco, o que dá contorno
 *    ao volume e destaca o objeto do fundo branco da seção.
 */

/** Espelham tokens do tailwind.config.js: primary-900, primary-600, primary-200. */
const SHADOW = 0x2a1454;
const BODY = 0x6b3acc;
const SHEEN = 0xd4c7ff;

const CAMERA_FOV = 32;
const CAMERA_DISTANCE = 7;

/** Abaixo disso a seção empilha e a cena passaria atrás do texto. */
const MIN_WIDTH = 1024;

const HORIZONTAL_OFFSET = -0.4;
const HEIGHT_RATIO = 0.6;

interface PlateConfig {
  width: number;
  depth: number;
  y: number;
  offsetX: number;
  offsetZ: number;
}

/** Menos placas e mais grossas: quatro se leem, sete viram uma pilha de folhas. */
const PLATES: PlateConfig[] = [
  { width: 1.32, depth: 0.86, y: 0.5, offsetX: 0.14, offsetZ: -0.08 },
  { width: 1.56, depth: 1.0, y: 0.17, offsetX: -0.08, offsetZ: 0.1 },
  { width: 1.8, depth: 1.14, y: -0.16, offsetX: 0.06, offsetZ: -0.05 },
  { width: 2.04, depth: 1.28, y: -0.49, offsetX: -0.12, offsetZ: 0.04 },
];

const THICKNESS = 0.1;
const CORNER = 0.09;
const BEVEL = 0.018;

/** Retângulo de cantos arredondados, para extrudar com bisel. */
const roundedRect = (width: number, height: number, radius: number) => {
  const shape = new THREE.Shape();
  const x = width / 2;
  const y = height / 2;

  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);

  return shape;
};

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
    const isHigh = quality.tier === "high";

    this.material = new THREE.MeshBasicNodeMaterial();
    this.material.colorNode = this.buildColorNode();

    for (const plate of PLATES) {
      const geometry = new THREE.ExtrudeGeometry(
        roundedRect(plate.width, plate.depth, CORNER),
        {
          depth: THICKNESS,
          bevelEnabled: true,
          bevelThickness: BEVEL,
          bevelSize: BEVEL,
          bevelSegments: isHigh ? 3 : 1,
          curveSegments: isHigh ? 8 : 4,
        }
      );
      // extrude cresce em +Z; deitar e centrar deixa a placa horizontal
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, THICKNESS / 2, 0);
      this.geometries.push(geometry);

      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.position.set(plate.offsetX, plate.y, plate.offsetZ);
      this.group.add(mesh);
    }

    // 3/4 de cima: é o ângulo em que a separação entre as camadas se lê
    this.group.rotation.set(-0.5, 0.6, 0);
    this.scene.add(this.group);
    this.camera.position.z = CAMERA_DISTANCE;
  }

  /** Iluminação falsa: sem luzes, sem sombras, sem textura. */
  private buildColorNode() {
    const { uSpread } = this;

    return Fn(() => {
      const normal = normalize(normalView);
      const view = positionViewDirection;

      // Luz fixa em view space: acompanha a câmera, então nenhuma face fica
      // completamente preta quando o grupo gira.
      const light = normalize(vec3(0.45, 0.85, 0.38));

      // Difusa com faixa larga: da sombra quase primary-900 até o corpo.
      const lambert = dot(normal, light).mul(0.5).add(0.5);
      const base = mix(
        color(SHADOW),
        color(BODY),
        smoothstep(0.1, 0.92, lambert)
      );

      // Especular Blinn-Phong: é o ponto de brilho que denuncia superfície
      // dura. Sem ele qualquer sólido parece papel fosco.
      const half = normalize(light.add(view));
      const specular = pow(saturate(dot(normal, half)), 42).mul(0.55);

      // Fresnel estreito para as quinas do bisel acenderem.
      const facing = saturate(dot(normal, view));
      const edge = pow(facing.oneMinus(), 3.2).mul(0.4);

      const glow = specular.add(edge).mul(uSpread.mul(0.3).add(0.85));

      return vec4(base.add(color(SHEEN).mul(glow)), 1);
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
      this.uSpread.value = 0.5;
      this.applySpread(0.5);
      return;
    }

    this.elapsed += delta;

    const scrolled = smoothstepScalar(0.1, 0.5, progress);
    const breath = 0.5 + 0.5 * Math.sin(this.elapsed * 0.32);
    const spread = scrolled * (0.55 + breath * 0.45);

    this.uSpread.value = spread;
    this.applySpread(spread);

    this.group.rotation.y = 0.6 + Math.sin(this.elapsed * 0.16) * 0.18;
    this.group.rotation.x = -0.5 + Math.sin(this.elapsed * 0.11) * 0.05;
  }

  /** Afasta as placas na vertical e acentua o deslize lateral. */
  private applySpread(spread: number) {
    this.group.children.forEach((child, index) => {
      const plate = PLATES[index];
      if (!plate) return;
      child.position.y = plate.y * (1 + spread * 0.5);
      child.position.x = plate.offsetX * (1 + spread * 1.5);
      child.position.z = plate.offsetZ * (1 + spread * 1.5);
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
