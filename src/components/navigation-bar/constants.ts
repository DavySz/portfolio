import type { TFunction } from "i18next";

/** Seções observadas pelo scroll-spy, na ordem do documento. */
export const SECTION_IDS = [
  "self",
  "services",
  "skills",
  "projects",
  "articles",
];

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
