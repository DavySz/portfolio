/**
 * Converte as imagens de `assets-src/images/` para WebP em `src/assets/`.
 *
 * O que existia antes:
 * - PNGs em tamanho de origem (a foto do hero tinha 1,4 MB em 1024²)
 * - quatro "SVGs" que na verdade eram PNG em base64 dentro de um <image>.
 *   Pior dos dois mundos: base64 infla 33% e o conteúdo continua bitmap.
 *   `quezzy` sozinho tinha 2,7 MB.
 *
 * SVG que embute bitmap é **rasterizado inteiro**, não "desembrulhado": alguns
 * compõem várias imagens com transform e clip (o rentx tem cinco), então
 * extrair o primeiro base64 perderia o resto da composição.
 *
 * SVG de vetor de verdade passa pelo SVGO e continua vetor. Vale a pena medir
 * antes de decidir: o bff-thumb tinha 395 paths com SEIS casas decimais em
 * cada coordenada, e com precisão de 2 casas ele cai para 34 kB gzip — menos
 * que os 56 kB do mesmo desenho rasterizado em WebP, e ainda nítido em
 * qualquer tamanho.
 *
 * Uso: yarn images:optimize
 */
import { readFile, readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, extname, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { optimize as optimizeSvg } from "svgo";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const INPUT_DIR = resolve(ROOT, "assets-src/images");
const OUTPUT_DIR = resolve(ROOT, "src/assets");

/**
 * Largura de saída por imagem, em px, já contando 2× para telas densas.
 * Quem não estiver aqui usa o padrão.
 */
const WIDTHS = {
  "user": 1000, // hero: exibida em no máximo 500px
  "portfolio": 1000, // seção "quem sou eu": 500px
};
const DEFAULT_WIDTH = 1200; // cards de projeto: ~600px numa grade de 2 colunas

/**
 * Cada bitmap sai em duas larguras: a cheia e a metade.
 *
 * O card do artigo mostra a imagem com ~400px de largura numa grade de três
 * colunas; servir a versão de 1200px ali é mandar 4× mais pixel do que a tela
 * usa. Com `srcset` o navegador escolhe pela largura real e pela densidade.
 */
const HALF_SUFFIX = "@half";

const QUALITY = 80;

/** Um SVG que embute bitmap é foto disfarçada de vetor. */
const hasEmbeddedBitmap = (svg) => /data:image\/[a-z]+;base64,/.test(svg);

/** DPI usado ao rasterizar SVG; 150 dá nitidez sem estourar o tamanho. */
const SVG_DENSITY = 150;

/** Casas decimais nas coordenadas. Abaixo de 2 o traço começa a tremer. */
const SVG_PRECISION = 2;

const format = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

if (!existsSync(INPUT_DIR)) {
  console.error(`[images] pasta de entrada não existe: ${INPUT_DIR}`);
  process.exit(1);
}

await mkdir(OUTPUT_DIR, { recursive: true });

const files = (await readdir(INPUT_DIR)).filter((file) =>
  /\.(png|jpe?g|svg|webp)$/i.test(file)
);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const input = join(INPUT_DIR, file);
  const name = basename(file, extname(file));
  const before = (await stat(input)).size;
  totalBefore += before;

  const source = await readFile(input);
  const isSvg = extname(file).toLowerCase() === ".svg";
  let note = "";

  if (isSvg && !hasEmbeddedBitmap(source.toString("utf8"))) {
    // vetor de verdade: continua vetor, mas sem a gordura do editor
    const output = join(OUTPUT_DIR, file);
    const optimized = optimizeSvg(source.toString("utf8"), {
      multipass: true,
      floatPrecision: SVG_PRECISION,
      plugins: ["preset-default", { name: "removeDimensions" }],
    }).data;

    await writeFile(output, optimized);
    totalAfter += optimized.length;
    const svgDelta = ((optimized.length - before) / before) * 100;
    console.log(
      `  ${file.padEnd(28)} ${format(before).padStart(9)} → ${format(optimized.length).padStart(9)}  (${svgDelta.toFixed(0)}%) (vetor, SVGO)`
    );
    continue;
  }

  if (isSvg) note = " (SVG com bitmap, rasterizado)";

  const width = WIDTHS[name] ?? DEFAULT_WIDTH;
  const output = join(OUTPUT_DIR, `${name}.webp`);

  const pipeline = () => sharp(source, isSvg ? { density: SVG_DENSITY } : {});

  await pipeline()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(output);

  const halfOutput = join(OUTPUT_DIR, `${name}${HALF_SUFFIX}.webp`);
  await pipeline()
    .resize({ width: Math.round(width / 2), withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(halfOutput);

  const after = (await stat(output)).size + (await stat(halfOutput)).size;
  totalAfter += after;

  const delta = ((after - before) / before) * 100;
  console.log(
    `  ${file.padEnd(28)} ${format(before).padStart(9)} → ${format(after).padStart(9)}  (${delta.toFixed(0)}%)${note}`
  );
}

const totalDelta = ((totalAfter - totalBefore) / totalBefore) * 100;
console.log(
  `\n  ${String(files.length).padStart(2)} imagens${" ".repeat(18)}${format(totalBefore).padStart(9)} → ${format(totalAfter).padStart(9)}  (${totalDelta.toFixed(0)}%)`
);
