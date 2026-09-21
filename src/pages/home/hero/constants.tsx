import { FaLinkedin, FaMedium } from "react-icons/fa";
import { FaGithubAlt } from "react-icons/fa";
import { CONTACTS } from "../../../shared/constants";

export const SOCIALS = [
  {
    icon: FaGithubAlt,
    name: "GitHub",
    href: CONTACTS.GITHUB,
  },
  {
    icon: FaLinkedin,
    name: "LinkedIn",
    href: CONTACTS.LINKEDIN,
  },
  {
    icon: FaMedium,
    name: "Medium",
    href: CONTACTS.MEDIUM,
  },
];
