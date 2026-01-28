import { FaGithubAlt, FaInstagram, FaLinkedin, FaMedium } from "react-icons/fa";
import { CONTACTS } from "../../../shared/constants";
import type { TFunction } from "i18next";

export const getLinks = (t: TFunction<"home", undefined>) => [
  { label: t("footer.links.home"), href: "/" },
  { label: t("footer.links.about"), href: "#self" },
  { label: t("footer.links.services"), href: "#services" },
  { label: t("footer.links.skills"), href: "#skills" },
  { label: t("footer.links.projects"), href: "#projects" },
  { label: t("footer.links.articles"), href: "#articles" },
];

export const SOCIALS = [
  {
    icon: FaGithubAlt,
    href: CONTACTS.GITHUB,
  },
  {
    icon: FaMedium,
    href: CONTACTS.MEDIUM,
  },
  {
    icon: FaLinkedin,
    href: CONTACTS.LINKEDIN,
  },
  {
    icon: FaInstagram,
    href: CONTACTS.INSTAGRAM,
  },
];
