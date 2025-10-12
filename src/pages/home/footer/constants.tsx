import { FaGithubAlt, FaInstagram, FaLinkedin, FaMedium } from "react-icons/fa";
import { CONTACTS } from "../../../shared/constants";

export const LINKS = [
  { label: "HOME", href: "/" },
  { label: "ABOUT ME", href: "#self" },
  { label: "SERVICES", href: "#services" },
  { label: "SKILLS", href: "#skills" },
  { label: "PROJECTS", href: "#projects" },
  { label: "ARTICLES", href: "#articles" },
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
