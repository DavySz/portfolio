/**
 * Página de debug do pipeline de assets — SÓ DESENVOLVIMENTO.
 *
 * Carrega o .glb otimizado por `yarn assets:optimize` nos dois backends
 * (WebGPU e WebGL2 via forceWebGL) e mostra o resultado na tela. Serve para
 * validar que Draco e KTX2/WebP decodificam de verdade no navegador.
 *
 * Como abrir:
 *   yarn dev  →  http://localhost:3000/debug-assets.html
 *
 * Não entra no build de produção: o Vite só empacota index.html, e nada da
 * aplicação importa este arquivo.
 */
import * as THREE from "three/webgpu";
import { disposeLoaders, loadModel } from "../experience/loaders";

const MODEL_URL = "/models/_test-cube.glb";

const output = document.querySelector<HTMLElement>("#output");

const log = (message: string, ok?: boolean) => {
  const line = document.createElement("p");
  line.textContent = message;
  if (ok !== undefined) line.dataset.status = ok ? "ok" : "fail";
  output?.appendChild(line);
  console.log(message);
};

const describe = (gltf: Awaited<ReturnType<typeof loadModel>>) => {
  let meshes = 0;
  let vertices = 0;
  const textures = new Set<string>();

  gltf.scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    meshes += 1;
    const position = child.geometry.getAttribute("position");
    if (position) vertices += position.count;
    const material = child.material as THREE.MeshStandardMaterial;
    if (material.map) textures.add(material.map.constructor.name);
  });

  const textureKinds = textures.size > 0 ? [...textures].join(", ") : "nenhuma";
  return `${meshes} mesh(es), ${vertices} vértices, texturas: ${textureKinds}`;
};

const testBackend = async (label: string, forceWebGL: boolean) => {
  const renderer = new THREE.WebGPURenderer({ forceWebGL, antialias: false });

  try {
    await renderer.init();
    const backend = renderer.backend.constructor.name;
    log(`${label}: backend ativo = ${backend}`);

    const gltf = await loadModel(MODEL_URL, renderer);
    log(`${label}: OK — ${describe(gltf)}`, true);
  } catch (error) {
    log(`${label}: FALHOU — ${String(error)}`, false);
  } finally {
    disposeLoaders();
    renderer.dispose();
  }
};

log(`modelo: ${MODEL_URL}`);
await testBackend("WebGPU (ou fallback automático)", false);
await testBackend("WebGL2 (forceWebGL: true)", true);
log("fim.");
