import { ProjectCardProps } from "../../../components/project-card/types";
import PlanningThumb from "../../../assets/planning-poker-thumb.svg";
import GoFinancesThumb from "../../../assets/go-finances-thumb.svg";
import QuezzyThumb from "../../../assets/quezzy-thumb.svg";
import RentxThumb from "../../../assets/rentx-thumb.svg";
import { TFunction } from "i18next";

export const getProjects = (
  t: TFunction<"home", undefined>
): ProjectCardProps[] => [
  {
    title: t("projects.items.quezzy.title"),
    link: "https://github.com/davysz/quezzy",
    category: "Frontend - Mobile",
    thumb: QuezzyThumb,
  },
  {
    title: t("projects.items.poker.title"),
    link: "https://github.com/davysz/planning-poker",

    category: "Frontend - Web",
    thumb: PlanningThumb,
  },
  {
    title: t("projects.items.rentx.title"),
    link: "https://github.com/davysz/rentx",

    category: "Frontend - Mobile",
    thumb: RentxThumb,
  },
  {
    title: t("projects.items.finances.title"),
    link: "https://github.com/davysz/go-finances-mobile",
    category: "Frontend - Mobile",
    thumb: GoFinancesThumb,
  },
];
