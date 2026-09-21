/**
 * Gera assets-src/models/_test-cube.glb programaticamente.
 * Serve para validar o pipeline de ponta a ponta sem depender do Blender.
 *
 * Uso: yarn assets:test-cube
 */
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, NodeIO } from "@gltf-transform/core";
import { encodePng } from "./lib/png.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = resolve(ROOT, "assets-src/models/_test-cube.glb");

const TEXTURE_SIZE = 256;
const CHECKER = 32;

/** Faces do cubo: normal + os dois eixos do plano da face (u × v = n). */
const FACES = [
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
];

const buildGeometry = () => {
  const positions = [];
  const normals = [];
  const texcoords = [];
  const indices = [];

  FACES.forEach(({ n, u, v }, face) => {
    // cantos na ordem (-u,-v) (+u,-v) (+u,+v) (-u,+v) → anti-horário visto de +n
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];

    for (const [su, sv] of corners) {
      for (let axis = 0; axis < 3; axis++) {
        positions.push((n[axis] + su * u[axis] + sv * v[axis]) * 0.5);
      }
      normals.push(...n);
      texcoords.push((su + 1) / 2, (sv + 1) / 2);
    }

    const base = face * 4;
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    texcoords: new Float32Array(texcoords),
    indices: new Uint16Array(indices),
  };
};

// Xadrez na cor da marca (primary-500 #7947DF) sobre quase-branco.
const texture = encodePng(TEXTURE_SIZE, TEXTURE_SIZE, (x, y) => {
  const on = (Math.floor(x / CHECKER) + Math.floor(y / CHECKER)) % 2 === 0;
  return on ? [0x79, 0x47, 0xdf] : [0xf3, 0xf0, 0xff];
});

const { positions, normals, texcoords, indices } = buildGeometry();

const document = new Document();
const buffer = document.createBuffer();

const primitive = document
  .createPrimitive()
  .setAttribute(
    "POSITION",
    document
      .createAccessor("POSITION")
      .setType("VEC3")
      .setArray(positions)
      .setBuffer(buffer)
  )
  .setAttribute(
    "NORMAL",
    document
      .createAccessor("NORMAL")
      .setType("VEC3")
      .setArray(normals)
      .setBuffer(buffer)
  )
  .setAttribute(
    "TEXCOORD_0",
    document
      .createAccessor("TEXCOORD_0")
      .setType("VEC2")
      .setArray(texcoords)
      .setBuffer(buffer)
  )
  .setIndices(
    document
      .createAccessor("indices")
      .setType("SCALAR")
      .setArray(indices)
      .setBuffer(buffer)
  )
  .setMaterial(
    document
      .createMaterial("test-material")
      .setBaseColorTexture(
        document
          .createTexture("test-checker")
          .setImage(texture)
          .setMimeType("image/png")
      )
      .setMetallicFactor(0)
      .setRoughnessFactor(0.6)
  );

document
  .createScene("scene")
  .addChild(
    document
      .createNode("test-cube")
      .setMesh(document.createMesh("test-cube").addPrimitive(primitive))
  );

await mkdir(dirname(OUTPUT), { recursive: true });
await new NodeIO().write(OUTPUT, document);

console.log(`cubo de teste gerado: ${OUTPUT}`);
