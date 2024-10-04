import { FaReact } from "react-icons/fa";
import { SkillCardProps } from "../../../components/skill-card/types";
import { IoLogoJavascript } from "react-icons/io5";
import { FaFigma } from "react-icons/fa";
import { FaNodeJs } from "react-icons/fa";
import { SiTypescript } from "react-icons/si";
import { IoLogoAndroid } from "react-icons/io";
import { SiNestjs } from "react-icons/si";

export const SKILLS: SkillCardProps["data"][] = [
  {
    icon: <FaReact size={72} color="#61DAFB" />,
    link: "https://react.dev/",
    title: "React",
  },
  {
    icon: <FaReact size={72} color="#61DAFB" />,
    link: "https://reactnative.dev/",
    title: "React Native",
  },
  {
    icon: <IoLogoJavascript size={72} color="#F7DF1E" />,
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    title: "Javascript",
  },
  {
    icon: <SiTypescript size={72} color="#007ACC" />,
    link: "https://www.typescriptlang.org/docs/",
    title: "Typescript",
  },
  {
    icon: <IoLogoAndroid size={72} color="#A4C639" />,
    link: "https://kotlinlang.org/docs/home.html",
    title: "Kotlin",
  },
  {
    icon: <FaFigma size={72} color="#F24E1E" />,
    link: "https://www.figma.com/",
    title: "Figma",
  },
  {
    icon: <FaNodeJs size={72} color="#8CC84B" />,
    link: "https://nodejs.org/",
    title: "Nodejs",
  },
  {
    icon: <SiNestjs size={72} color="#E0234E" />,
    link: "https://docs.nestjs.com/",
    title: "Nestjs",
  },
];
