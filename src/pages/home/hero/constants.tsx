import { FaLinkedin, FaMedium } from "react-icons/fa";
import { FaGithubAlt } from "react-icons/fa";
import { CONTACTS } from "../../../shared/constants";

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
    icon: FaMedium,
    href: CONTACTS.MEDIUM,
  },
];
