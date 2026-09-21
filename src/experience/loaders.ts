import type * as THREE from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Os decoders são copiados de node_modules/three para public/decoders/ pelo
 * script assets:decoders (roda no postinstall). Caminhos absolutos porque o
 * loader os baixa em runtime — não passam pelo bundler.
 */
const DRACO_PATH = "/decoders/draco/";
const BASIS_PATH = "/decoders/basis/";

let loader: GLTFLoader | undefined;
let draco: DRACOLoader | undefined;
let ktx2: KTX2Loader | undefined;

/**
 * Monta o GLTFLoader uma única vez e reaproveita: cada DRACOLoader/KTX2Loader
 * sobe workers próprios, então instanciar por modelo desperdiçaria threads.
 */
const getLoader = (renderer: THREE.WebGPURenderer): GLTFLoader => {
  if (loader) return loader;

  draco = new DRACOLoader().setDecoderPath(DRACO_PATH);
  ktx2 = new KTX2Loader().setTranscoderPath(BASIS_PATH);

  // detectSupport descobre quais formatos de textura comprimida a GPU aceita
  // (ASTC, BC7, ETC2…) e escolhe como transcodificar o KTX2.
  // A assinatura já aceita WebGPURenderer; precisa rodar depois de renderer.init().
  ktx2.detectSupport(renderer);

  loader = new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2);
  return loader;
};

export const loadModel = (
  url: string,
  renderer: THREE.WebGPURenderer
): Promise<GLTF> => {
  const gltf = getLoader(renderer);
  return gltf.loadAsync(url);
};

/** Encerra os workers do Draco e do Basis. Chamar no dispose do Experience. */
export const disposeLoaders = (): void => {
  draco?.dispose();
  ktx2?.dispose();
  draco = undefined;
  ktx2 = undefined;
  loader = undefined;
};
