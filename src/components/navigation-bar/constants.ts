import { TFunction } from "i18next";

export const getLinks = (t: TFunction<"component", undefined>) => [
  {
    href: "/",
    label: t("navigation-bar.home"),
  },
  {
    href: "#self",
    label: t("navigation-bar.about"),
  },
  {
    href: "#services",
    label: t("navigation-bar.services"),
  },
  {
    href: "#skills",
    label: t("navigation-bar.skills"),
  },
  {
    href: "#projects",
    label: t("navigation-bar.projects"),
  },
  {
    href: "#articles",
    label: t("navigation-bar.articles"),
  },
];
