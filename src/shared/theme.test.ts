import { afterEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  isThemePreference,
  readStoredPreference,
  resolveTheme,
  storePreference,
} from "./theme";

/**
 * O ambiente de teste é `node`, sem `window`. Em vez de trazer jsdom só para
 * isto, o par de funções que fala com o `localStorage` roda contra um duplo
 * mínimo — é só o que elas tocam.
 */
const stubWindow = (store: Record<string, string>, quebrado = false) => {
  const localStorage = {
    getItem: (k: string) => {
      if (quebrado) throw new Error("modo privado");
      return k in store ? store[k] : null;
    },
    setItem: (k: string, v: string) => {
      if (quebrado) throw new Error("modo privado");
      store[k] = v;
    },
    removeItem: (k: string) => {
      if (quebrado) throw new Error("modo privado");
      delete store[k];
    },
  };
  vi.stubGlobal("window", { localStorage });
};

afterEach(() => vi.unstubAllGlobals());

describe("resolveTheme", () => {
  it("escolha explícita ganha do sistema", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("sem escolha, o sistema decide", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("isThemePreference", () => {
  it("aceita os três estados", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
  });

  it("recusa qualquer outra coisa", () => {
    for (const valor of ["DARK", "auto", "", null, undefined, 1, {}]) {
      expect(isThemePreference(valor)).toBe(false);
    }
  });
});

describe("readStoredPreference", () => {
  it("devolve o que está salvo", () => {
    stubWindow({ [THEME_STORAGE_KEY]: "dark" });
    expect(readStoredPreference()).toBe("dark");
  });

  it("cai em system quando não há nada salvo", () => {
    stubWindow({});
    expect(readStoredPreference()).toBe("system");
  });

  /* Um valor corrompido ou de uma versão antiga não pode deixar a pessoa sem
     site: cai no padrão em vez de propagar lixo. */
  it("cai em system com valor inválido", () => {
    stubWindow({ [THEME_STORAGE_KEY]: "roxo" });
    expect(readStoredPreference()).toBe("system");
  });

  it("cai em system quando o storage lança", () => {
    stubWindow({}, true);
    expect(readStoredPreference()).toBe("system");
  });

  it("cai em system sem window", () => {
    vi.stubGlobal("window", undefined);
    expect(readStoredPreference()).toBe("system");
  });
});

describe("storePreference", () => {
  it("grava a escolha explícita", () => {
    const store: Record<string, string> = {};
    stubWindow(store);
    storePreference("dark");
    expect(store[THEME_STORAGE_KEY]).toBe("dark");
  });

  /* `system` é a ausência de escolha: apagar em vez de gravar a string faz a
     pessoa voltar a seguir o sistema de verdade, inclusive em outra aba. */
  it("apaga a chave ao voltar para system", () => {
    const store: Record<string, string> = { [THEME_STORAGE_KEY]: "dark" };
    stubWindow(store);
    storePreference("system");
    expect(THEME_STORAGE_KEY in store).toBe(false);
  });

  it("não lança quando o storage lança", () => {
    stubWindow({}, true);
    expect(() => storePreference("light")).not.toThrow();
  });
});
