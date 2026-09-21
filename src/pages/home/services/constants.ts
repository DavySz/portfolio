import type { TFunction } from "i18next";
import type { ServiceListProps } from "../../../components/service-list/types";

export const getServices = (
  t: TFunction<"home", undefined>
): ServiceListProps["data"] => [
  {
    isHighlighted: true,
    title: t("services.items.mobile.title"),
    description: t("services.items.mobile.description"),
  },
  {
    isHighlighted: true,
    title: t("services.items.web.title"),
    description: t("services.items.web.description"),
  },
  {
    isHighlighted: false,
    title: t("services.items.design.title"),
    description: t("services.items.design.description"),
  },
  {
    isHighlighted: false,
    title: t("services.items.backend.title"),
    description: t("services.items.backend.description"),
  },
];
