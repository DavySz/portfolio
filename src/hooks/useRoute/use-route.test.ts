import { describe, expect, it } from "vitest";
import { legacyHashToPath, parseRoute } from "./use-route";

describe("parseRoute", () => {
  it("lê o slug de um caminho de artigo", () => {
    expect(parseRoute("/artigos/micro-frontends")).toEqual({
      slug: "micro-frontends",
      heading: null,
    });
  });

  it("lê a âncora de seção do fragmento", () => {
    expect(parseRoute("/artigos/micro-frontends", "#por-que")).toEqual({
      slug: "micro-frontends",
      heading: "por-que",
    });
  });

  it("tolera barra final", () => {
    expect(parseRoute("/artigos/micro-frontends/").slug).toBe(
      "micro-frontends"
    );
  });

  it("devolve slug nulo na home", () => {
    expect(parseRoute("/")).toEqual({ slug: null, heading: null });
  });

  it("não confunde âncora de seção da home com artigo", () => {
    expect(parseRoute("/", "#skills")).toEqual({ slug: null, heading: null });
  });

  it("devolve slug nulo em caminho que não é de artigo", () => {
    expect(parseRoute("/sobre").slug).toBeNull();
    expect(parseRoute("/artigosx/foo").slug).toBeNull();
  });

  it("devolve slug nulo no índice sem slug", () => {
    expect(parseRoute("/artigos").slug).toBeNull();
    expect(parseRoute("/artigos/").slug).toBeNull();
  });

  /* Slug inexistente é rota válida: quem decide que não existe é o catálogo,
     não o parser. O leitor cai no estado "artigo não encontrado". */
  it("aceita um slug que não existe no catálogo", () => {
    expect(parseRoute("/artigos/nao-existe").slug).toBe("nao-existe");
  });

  it("decodifica caractere escapado", () => {
    expect(parseRoute("/artigos/efeito-enem%2Dno-codigo").slug).toBe(
      "efeito-enem-no-codigo"
    );
  });
});

describe("legacyHashToPath", () => {
  it("converte um link antigo de artigo", () => {
    expect(legacyHashToPath("#/artigos/micro-frontends")).toBe(
      "/artigos/micro-frontends"
    );
  });

  it("preserva a seção do artigo no fragmento novo", () => {
    expect(legacyHashToPath("#/artigos/micro-frontends/por-que")).toBe(
      "/artigos/micro-frontends#por-que"
    );
  });

  /* O caso que não pode dar errado: âncora de seção da home é link legítimo
     e continua sendo. Converter isso mandaria /#skills para /artigos/skills. */
  it("NÃO converte âncora de seção da home", () => {
    expect(legacyHashToPath("#skills")).toBeNull();
    expect(legacyHashToPath("#contact")).toBeNull();
    expect(legacyHashToPath("#main-content")).toBeNull();
  });

  it("devolve nulo para hash vazio", () => {
    expect(legacyHashToPath("")).toBeNull();
    expect(legacyHashToPath("#")).toBeNull();
  });

  it("devolve nulo para o prefixo sem slug", () => {
    expect(legacyHashToPath("#/artigos/")).toBeNull();
  });
});
