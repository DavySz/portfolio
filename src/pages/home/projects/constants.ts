import type { ProjectCardProps } from "../../../components/project-card/types";
import PlanningThumb from "../../../assets/planning-poker-thumb.webp";
import PlanningThumbHalf from "../../../assets/planning-poker-thumb@half.webp";
import GoFinancesThumb from "../../../assets/go-finances-thumb.webp";
import GoFinancesThumbHalf from "../../../assets/go-finances-thumb@half.webp";
import QuezzyThumb from "../../../assets/quezzy-thumb.webp";
import QuezzyThumbHalf from "../../../assets/quezzy-thumb@half.webp";
import RentxThumb from "../../../assets/rentx-thumb.webp";
import RentxThumbHalf from "../../../assets/rentx-thumb@half.webp";
import type { TFunction } from "i18next";

export const getProjects = (
  t: TFunction<"home", undefined>
): ProjectCardProps[] => [
  {
    title: t("projects.items.quezzy.title"),
    link: "https://github.com/davysz/quezzy",
    category: "Frontend - Mobile",
    thumb: { src: QuezzyThumb, half: QuezzyThumbHalf, width: 1200 },
  },
  {
    title: t("projects.items.poker.title"),
    link: "https://github.com/davysz/planning-poker",

    category: "Frontend - Web",
    thumb: { src: PlanningThumb, half: PlanningThumbHalf, width: 1200 },
  },
  {
    title: t("projects.items.rentx.title"),
    link: "https://github.com/davysz/rentx",

    category: "Frontend - Mobile",
    thumb: { src: RentxThumb, half: RentxThumbHalf, width: 1200 },
  },
  {
    title: t("projects.items.finances.title"),
    link: "https://github.com/davysz/go-finances-mobile",
    category: "Frontend - Mobile",
    thumb: { src: GoFinancesThumb, half: GoFinancesThumbHalf, width: 1200 },
  },
];
