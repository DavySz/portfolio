import { FaGithubAlt, FaInstagram, FaLinkedin, FaMedium } from "react-icons/fa";
import { CONTACTS } from "../../../shared/constants";
import type { TFunction } from "i18next";
import { sectionHref } from "../../../hooks/useRoute/use-route";

/**
 * Os mesmos destinos do menu do topo, com os rótulos do rodapé.
 *
 * Os `href` saem de `sectionHref` para não divergirem do menu: são duas
 * listas de rótulos, mas um endereço só por seção.
 */
export const getLinks = (t: TFunction<"home", undefined>) => [
  { label: t("footer.links.home"), href: "/" },
  { label: t("footer.links.about"), href: sectionHref("self") },
  { label: t("footer.links.services"), href: sectionHref("services") },
  { label: t("footer.links.skills"), href: sectionHref("skills") },
  { label: t("footer.links.projects"), href: sectionHref("projects") },
  { label: t("footer.links.articles"), href: sectionHref("articles") },
];

export const SOCIALS = [
  {
    icon: FaGithubAlt,
    name: "GitHub",
    href: CONTACTS.GITHUB,
  },
  {
    icon: FaMedium,
    name: "Medium",
    href: CONTACTS.MEDIUM,
  },
  {
    icon: FaLinkedin,
    name: "LinkedIn",
    href: CONTACTS.LINKEDIN,
  },
  {
    icon: FaInstagram,
    name: "Instagram",
    href: CONTACTS.INSTAGRAM,
  },
];
