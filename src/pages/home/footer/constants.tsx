import { FaGithubAlt, FaInstagram, FaLinkedin } from "react-icons/fa";
import { CONTACTS } from "../../../shared/constants";

export const LINKS = [
  { label: "HOME", href: "/" },
  { label: "ABOUT ME", href: "#self" },
  { label: "SERVICES", href: "#services" },
  { label: "SKILLS", href: "#skills" },
  { label: "WORK TOGETHER", href: "#contact" },
  { label: "PROJECTS", href: "#projects" },
];

export const SOCIALS = [
  {
    icon: FaGithubAlt,
    href: CONTACTS.GITHUB,
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
