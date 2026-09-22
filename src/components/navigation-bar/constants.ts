import type { TFunction } from "i18next";
import { sectionHref } from "../../hooks/useRoute/use-route";

/** Seções observadas pelo scroll-spy, na ordem do documento. */
export const SECTION_IDS = [
  "self",
  "services",
  "skills",
  "projects",
  "articles",
];

/**
 * Os destinos do menu, na ordem em que aparecem.
 *
 * Os `href` passam por `sectionHref` em vez de serem `#self` escritos à mão:
 * um fragmento puro é relativo ao documento atual, e o menu também é servido
 * dentro dos artigos — lá `#self` virava uma seção inexistente daquele texto.
 */
export const getLinks = (t: TFunction<"component", undefined>) => [
  {
    href: "/",
    label: t("navigation-bar.home"),
  },
  {
    href: sectionHref("self"),
    label: t("navigation-bar.about"),
  },
  {
    href: sectionHref("services"),
    label: t("navigation-bar.services"),
  },
  {
    href: sectionHref("skills"),
    label: t("navigation-bar.skills"),
  },
  {
    href: sectionHref("projects"),
    label: t("navigation-bar.projects"),
  },
  {
    href: sectionHref("articles"),
    label: t("navigation-bar.articles"),
  },
];
