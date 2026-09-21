/**
 * Copia os decoders Draco e Basis (KTX2) do three para public/decoders/.
 *
 * Roda no postinstall para os decoders nunca ficarem dessincronizados da
 * versão do three: eles são baixados em runtime pelo GLTFLoader/KTX2Loader,
 * então não passam pelo bundler e não têm como o Vite garantir a versão.
 *
 * A pasta de saída é ignorada pelo git — é derivada de node_modules.
 *
 * Uso: yarn assets:decoders
 */
import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const THREE_LIBS = resolve(ROOT, "node_modules/three/examples/jsm/libs");
const OUTPUT = resolve(ROOT, "public/decoders");

const SOURCES = [
  // decoder específico de glTF: menor que o genérico de draco/
  { from: resolve(THREE_LIBS, "draco/gltf"), to: resolve(OUTPUT, "draco") },
  { from: resolve(THREE_LIBS, "basis"), to: resolve(OUTPUT, "basis") },
];

if (!existsSync(THREE_LIBS)) {
  // Não derruba o install: o postinstall pode rodar antes do three estar linkado.
  console.warn(
    "[assets:decoders] three não encontrado em node_modules; pulando.\n" +
      "                  Rode `yarn assets:decoders` depois do install."
  );
  process.exit(0);
}

for (const { from, to } of SOURCES) {
  if (!existsSync(from)) {
    console.error(`[assets:decoders] origem ausente: ${from}`);
    process.exit(1);
  }
  await rm(to, { recursive: true, force: true });
  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true });
  console.log(`[assets:decoders] ${from.replace(ROOT + "/", "")} → ${to.replace(ROOT + "/", "")}`);
}
