import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Confere a saída real do pré-render.
 *
 * Depende de `dist/`, que só existe depois do build — por isso o bloco é
 * pulado quando ele não está lá, em vez de falhar. Rodar `yarn build` antes
 * é o que faz este teste valer alguma coisa.
 */
const DIST = resolve(__dirname, "../../dist");
const SITE = "https://davysz.com";
const temDist = existsSync(resolve(DIST, "index.html"));

const contar = (html: string, padrao: RegExp) =>
  (html.match(padrao) ?? []).length;

const metaChaves = (head: string) => {
  const chaves: string[] = [];
  for (const m of head.matchAll(/<meta\s+([^>]*?)\/?>/g)) {
    const atributos = m[1];
    const nome = /\bname="([^"]+)"/.exec(atributos);
    const prop = /\bproperty="([^"]+)"/.exec(atributos);
    if (nome) chaves.push(`name=${nome[1]}`);
    else if (prop) chaves.push(`property=${prop[1]}`);
  }
  return chaves;
};

describe.skipIf(!temDist)("saída do pré-render", () => {
  const slugs = existsSync(resolve(DIST, "artigos"))
    ? readdirSync(resolve(DIST, "artigos"))
    : [];

  it("gera uma página por artigo do catálogo", () => {
    expect(slugs.length).toBe(8);
  });

  it.each(slugs)("%s: head coerente e sem duplicata", (slug) => {
    const html = readFileSync(
      resolve(DIST, "artigos", slug, "index.html"),
      "utf8"
    );
    const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));

    expect(contar(head, /<title>/g)).toBe(1);
    expect(contar(head, /rel="canonical"/g)).toBe(1);

    const chaves = metaChaves(head);
    const duplicadas = chaves.filter((k, i) => chaves.indexOf(k) !== i);
    expect(duplicadas).toEqual([]);

    const esperada = `${SITE}/artigos/${slug}`;
    expect(
      /<link rel="canonical" href="([^"]+)"/.exec(head)?.[1]
    ).toBe(esperada);
    expect(
      /<meta property="og:url" content="([^"]+)"/.exec(head)?.[1]
    ).toBe(esperada);
    // I11: o twitter:url acompanhava só o index.html, fixo na home
    expect(
      /<meta name="twitter:url" content="([^"]+)"/.exec(head)?.[1]
    ).toBe(esperada);

    // og:image precisa ser absoluto: scraper descarta caminho relativo
    expect(
      /<meta property="og:image" content="([^"]+)"/.exec(head)?.[1]
    ).toMatch(new RegExp(`^${SITE}/`));

    // título e descrição não podem ficar com o texto da home
    const titulo = /<title>([^<]*)<\/title>/.exec(head)?.[1] ?? "";
    expect(titulo).not.toMatch(/Frontend Engineer & Fintech Specialist$/);
    expect(titulo.length).toBeGreaterThan(10);
  });

  it("a home aponta o canonical para a raiz", () => {
    const html = readFileSync(resolve(DIST, "index.html"), "utf8");
    expect(/<link rel="canonical" href="([^"]+)"/.exec(html)?.[1]).toBe(
      `${SITE}/`
    );
    expect(contar(html, /rel="canonical"/g)).toBe(1);
  });

  it("a 404 não carrega o app e não é indexável", () => {
    const html = readFileSync(resolve(DIST, "404.html"), "utf8");
    expect(html).not.toMatch(/type="module"/);
    expect(html).toMatch(/name="robots" content="noindex/);
  });
});
