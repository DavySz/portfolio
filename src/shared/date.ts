/**
 * Formata uma data do catálogo (`YYYY-MM-DD`) sem deslocar o dia.
 *
 * `new Date("2026-09-21")` é lido como meia-noite **UTC**, e o
 * `Intl.DateTimeFormat` formata no fuso local. Em qualquer fuso a oeste de
 * Greenwich o resultado sai um dia atrás — que é o caso de todo o Brasil:
 *
 *     UTC               -> 21 de setembro de 2026
 *     America/Manaus    -> 20 de setembro de 2026
 *     America/Sao_Paulo -> 20 de setembro de 2026
 *
 * Formatar em UTC devolve a mesma data de calendário que está escrita no
 * catálogo, em qualquer fuso. É o mesmo princípio que o
 * `scripts/content/build-feeds.js` já usa ao ancorar o `pubDate` em
 * `T12:00:00Z`.
 *
 * Toda data de artigo que aparece na tela passa por aqui: `new Date` solto com
 * string `YYYY-MM-DD` volta a introduzir o erro.
 */
export const formatCatalogDate = (
  date: string,
  language: string,
  options: Intl.DateTimeFormatOptions
): string =>
  new Intl.DateTimeFormat(language, { ...options, timeZone: "UTC" }).format(
    new Date(date)
  );
