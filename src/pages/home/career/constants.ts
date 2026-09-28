import type { TFunction } from "i18next";
import type { CareerEntryProps } from "../../../components/career-entry/types";

/**
 * A trilha, do mais recente para o mais antigo.
 *
 * As chaves de cada bullet são nomeadas em vez de índices, e cada `t()` é uma
 * chamada explícita — o mesmo desenho de `getServices` e `getProjects`. Guardar
 * os bullets como array no JSON pediria `returnObjects` com cast, porque o
 * projeto não tem augmentation de tipos do i18next.
 *
 * Fretebras é um nó só, com a progressão Pleno → Sênior dentro: foram dois
 * cargos, mas uma casa e uma promoção.
 */
export const getCareer = (
  t: TFunction<"home", undefined>
): CareerEntryProps[] => [
  {
    company: t("career.items.fretebras.company"),
    role: t("career.items.fretebras.role"),
    period: t("career.items.fretebras.period"),
    summary: t("career.items.fretebras.summary"),
    groups: [
      {
        label: t("career.labels.products"),
        items: [
          t("career.items.fretebras.products.pool"),
          t("career.items.fretebras.products.credit"),
          t("career.items.fretebras.products.banking"),
          t("career.items.fretebras.products.platform"),
        ],
      },
      {
        label: t("career.labels.challenges"),
        items: [
          t("career.items.fretebras.challenges.pool"),
          t("career.items.fretebras.challenges.duplication"),
          t("career.items.fretebras.challenges.tracking"),
          t("career.items.fretebras.challenges.federation"),
          t("career.items.fretebras.challenges.bff"),
        ],
      },
    ],
    stackLabel: t("career.labels.stack"),
    stack: t("career.items.fretebras.stack"),
    moreLabel: t("career.more"),
    isCurrent: true,
    hasNext: true,
  },
  {
    company: t("career.items.loldesign.company"),
    role: t("career.items.loldesign.role"),
    period: t("career.items.loldesign.period"),
    summary: t("career.items.loldesign.summary"),
    groups: [
      {
        label: t("career.labels.products"),
        items: [
          t("career.items.loldesign.products.network"),
          t("career.items.loldesign.products.payments"),
          t("career.items.loldesign.products.banking"),
        ],
      },
      {
        label: t("career.labels.challenges"),
        items: [
          t("career.items.loldesign.challenges.bridge"),
          t("career.items.loldesign.challenges.gradle"),
          t("career.items.loldesign.challenges.foundation"),
        ],
      },
    ],
    stackLabel: t("career.labels.stack"),
    stack: t("career.items.loldesign.stack"),
    moreLabel: t("career.more"),
    isCurrent: false,
    hasNext: false,
  },
];
