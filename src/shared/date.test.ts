import { afterEach, describe, expect, it } from "vitest";
import { formatCatalogDate } from "./date";

const MONTH_YEAR: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};
const FULL: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

const originalTz = process.env.TZ;
afterEach(() => {
  process.env.TZ = originalTz;
});

describe("formatCatalogDate", () => {
  it("mantém o dia do catálogo em fuso negativo", () => {
    process.env.TZ = "America/Manaus"; // UTC-4, onde o bug aparecia
    expect(formatCatalogDate("2026-09-21", "en", FULL)).toBe(
      "September 21, 2026"
    );
  });

  it("mantém o dia do catálogo em fuso positivo", () => {
    process.env.TZ = "Asia/Tokyo"; // UTC+9, que erraria na direção oposta
    expect(formatCatalogDate("2026-09-21", "en", FULL)).toBe(
      "September 21, 2026"
    );
  });

  it("não volta um mês no dia 01 em fuso negativo", () => {
    process.env.TZ = "America/Manaus";
    expect(formatCatalogDate("2026-01-01", "en", MONTH_YEAR)).toBe("Jan 2026");
  });

  it("dá o mesmo resultado em qualquer fuso", () => {
    const saida = ["UTC", "America/Manaus", "America/Sao_Paulo", "Asia/Tokyo"].map(
      (tz) => {
        process.env.TZ = tz;
        return formatCatalogDate("2026-01-01", "pt", FULL);
      }
    );

    expect(new Set(saida).size).toBe(1);
  });

  it("segue o idioma pedido", () => {
    expect(formatCatalogDate("2026-09-21", "pt", MONTH_YEAR)).toBe(
      "set. de 2026"
    );
  });

  /*
   * Guarda de regressão: prova que o bug existe de verdade e que é o
   * `timeZone: "UTC"` do helper que o evita. Sem isto, os testes acima
   * passariam mesmo com a implementação ingênua, se o CI rodasse em UTC.
   */
  it("diverge da formatação ingênua no fuso local", () => {
    const ingenua = new Intl.DateTimeFormat("en", {
      ...MONTH_YEAR,
      timeZone: "America/Manaus",
    }).format(new Date("2026-01-01"));

    expect(ingenua).toBe("Dec 2025");
    expect(formatCatalogDate("2026-01-01", "en", MONTH_YEAR)).toBe("Jan 2026");
  });
});
