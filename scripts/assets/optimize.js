/**
 * Otimiza todo .glb de assets-src/models/ para public/models/.
 *
 * Pipeline (cada slot de textura quer um codec diferente):
 *   1. optimize  — dedup, prune, join, flatten, weld (sem tocar em geometria/textura)
 *   2. uastc     — KTX2/UASTC nos normal maps (preserva direção; ETC1S borraria)
 *   3. etc1s     — KTX2/ETC1S nas demais texturas (cor, emissive, orm)
 *   4. draco     — quantiza e comprime a geometria
 *
 * A ordem importa: cada invocação da CLI é um ciclo ler→transformar→escrever, e
 * a leitura DESCOMPRIME o Draco. Se o Draco rodasse antes das texturas, o passo
 * seguinte o desfaria silenciosamente (o .glb sairia sem
 * KHR_draco_mesh_compression). Por isso ele é sempre o último passo.
 *
 * KTX2 exige o binário `ktx` (KTX-Software), que não vem do npm. Sem ele o
 * script cai para WebP e avisa — o site continua funcionando, só perde a
 * economia de VRAM (WebP descomprime para RGBA na GPU; KTX2 fica comprimido).
 *
 * Uso: yarn assets:optimize
 */
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const INPUT_DIR = resolve(ROOT, "assets-src/models");
const OUTPUT_DIR = resolve(ROOT, "public/models");
const TMP_DIR = resolve(ROOT, "node_modules/.cache/assets-optimize");
const CLI = resolve(ROOT, "node_modules/.bin/gltf-transform");

/** Slots de textura que devem virar UASTC em vez de ETC1S. */
const UASTC_SLOTS = "{normalTexture}";
const ETC1S_SLOTS =
  "{baseColorTexture,emissiveTexture,occlusionTexture,metallicRoughnessTexture}";

const KTX_INSTALL_HELP = `
  O binário 'ktx' (KTX-Software) não foi encontrado no PATH.
  Ele não vem pelo npm/yarn: é um pacote nativo.

  Ubuntu / WSL:
    1. Baixe o .deb mais recente em
       https://github.com/KhronosGroup/KTX-Software/releases
       (procure por KTX-Software-<versao>-Linux-x86_64.deb)
    2. sudo apt install ./KTX-Software-*-Linux-x86_64.deb
    3. ktx --version    # confirma a instalação

  Alternativa por Homebrew (Linux ou macOS):
    brew install ktx

  Enquanto isso, este script usa WebP no lugar de KTX2.
`;

const hasKtx = () => {
  try {
    execFileSync("ktx", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const run = (args) => {
  execFileSync(CLI, args, { stdio: ["ignore", "ignore", "inherit"] });
};

const sizeOf = async (path) => (await stat(path)).size;

const format = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

if (!existsSync(INPUT_DIR)) {
  console.error(`[assets:optimize] pasta de entrada não existe: ${INPUT_DIR}`);
  console.error("                  crie-a e coloque os .glb exportados do Blender.");
  process.exit(1);
}

const models = (await readdir(INPUT_DIR)).filter((file) =>
  file.toLowerCase().endsWith(".glb")
);

if (models.length === 0) {
  console.warn(`[assets:optimize] nenhum .glb em ${INPUT_DIR}; nada a fazer.`);
  process.exit(0);
}

const ktx = hasKtx();
if (!ktx) {
  console.warn("\x1b[33m%s\x1b[0m", "[assets:optimize] AVISO — KTX2 indisponível.");
  console.warn(KTX_INSTALL_HELP);
}

await mkdir(OUTPUT_DIR, { recursive: true });
await rm(TMP_DIR, { recursive: true, force: true });
await mkdir(TMP_DIR, { recursive: true });

let totalBefore = 0;
let totalAfter = 0;

for (const model of models) {
  const input = join(INPUT_DIR, model);
  const output = join(OUTPUT_DIR, model);
  const name = basename(model, ".glb");

  const before = await sizeOf(input);

  // 1. limpeza da cena. --simplify false: não decimar malha autorada sem o Davy
  //    pedir; redução de triângulos é decisão de modelagem, não do pipeline.
  const cleaned = join(TMP_DIR, `${name}.clean.glb`);
  run([
    "optimize",
    input,
    cleaned,
    "--compress",
    "false",
    "--texture-compress",
    "false",
    "--simplify",
    "false",
  ]);

  // 2 e 3. texturas
  const textured = join(TMP_DIR, `${name}.textured.glb`);
  if (ktx) {
    const withNormals = join(TMP_DIR, `${name}.uastc.glb`);
    run(["uastc", cleaned, withNormals, "--slots", UASTC_SLOTS, "--level", "2"]);
    run([
      "etc1s",
      withNormals,
      textured,
      "--slots",
      ETC1S_SLOTS,
      "--quality",
      "128",
    ]);
  } else {
    run(["webp", cleaned, textured]);
  }

  // 4. Draco por último, senão o passo de textura desfaz a compressão.
  run([
    "draco",
    textured,
    output,
    "--method",
    "edgebreaker",
    "--quantize-position",
    "14",
    "--quantize-normal",
    "10",
    "--quantize-texcoord",
    "12",
  ]);

  const after = await sizeOf(output);
  totalBefore += before;
  totalAfter += after;

  const delta = before === 0 ? 0 : ((after - before) / before) * 100;
  console.log(
    `${model.padEnd(28)} ${format(before).padStart(10)} → ${format(after).padStart(10)}  (${delta > 0 ? "+" : ""}${delta.toFixed(1)}%)`
  );
}

await rm(TMP_DIR, { recursive: true, force: true });

const totalDelta =
  totalBefore === 0 ? 0 : ((totalAfter - totalBefore) / totalBefore) * 100;
console.log(
  `\n${String(models.length).padStart(2)} modelo(s)${" ".repeat(18)}${format(totalBefore).padStart(10)} → ${format(totalAfter).padStart(10)}  (${totalDelta > 0 ? "+" : ""}${totalDelta.toFixed(1)}%)`
);
console.log(`texturas: ${ktx ? "KTX2 (UASTC + ETC1S)" : "WebP (fallback, sem ktx)"}`);
