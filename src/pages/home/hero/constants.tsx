import { FaLinkedin } from "react-icons/fa";
import { FaGithubAlt } from "react-icons/fa";
import { CONTACTS } from "../../../shared/constants";

export const SOCIALS = [
  {
    icon: <FaGithubAlt size={24} color="#7041CF" />,
    href: CONTACTS.GITHUB,
  },
  {
    icon: <FaLinkedin size={24} color="#7041CF" />,
    href: CONTACTS.LINKEDIN,
  },
];
