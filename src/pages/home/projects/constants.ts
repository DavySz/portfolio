import { ProjectCardProps } from "../../../components/project-card/types";
import PlanningThumb from "../../../assets/planning-poker-thumb.svg";
import GoFinancesThumb from "../../../assets/go-finances-thumb.svg";
import QuezzyThumb from "../../../assets/quezzy-thumb.svg";
import RentxThumb from "../../../assets/rentx-thumb.svg";

export const PROJECTS: ProjectCardProps[] = [
  {
    title: "Quezzy - Gamified app making learning interactive and engaging.",
    link: "https://github.com/davysz/quezzy",
    category: "Frontend - Mobile",
    thumb: QuezzyThumb,
  },
  {
    title: "Planning Poker - Gamified app for task estimation in Agile teams.",
    link: "https://github.com/davysz/planning-poker",

    category: "Frontend - Web",
    thumb: PlanningThumb,
  },
  {
    title:
      "Rentx - Car booking app with an optimistic interface and Offline First implementation.",
    link: "https://github.com/davysz/rentx",

    category: "Frontend - Mobile",
    thumb: RentxThumb,
  },
  {
    title:
      "Go Finances - Financial control app for managing transactions and tracking income and expenses.",
    link: "https://github.com/davysz/go-finances-mobile",
    category: "Frontend - Mobile",
    thumb: GoFinancesThumb,
  },
];
