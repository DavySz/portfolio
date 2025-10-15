import { ProjectCardProps } from "../../../components/project-card/types";
import BFFThumb from "../../../assets/bff-thumb.svg";
import ENEMThumb from "../../../assets/enem-thumb.png";
import { TFunction } from "i18next";

export const getArticles = (
  t: TFunction<"home", undefined>
): ProjectCardProps[] => [
  {
    title: t("articles.items.bff.title"),
    link: "https://medium.com/@davysz/bff-por-que-o-frontend-deveria-liderar-essa-revolu%C3%A7%C3%A3o-3b1f298be38a",
    category: "Article",
    thumb: BFFThumb,
  },
  {
    title: t("articles.items.enem.title"),
    link: "https://medium.com/@davysz/o-efeito-enem-no-c%C3%B3digo-como-estudar-para-passar-criou-uma-gera%C3%A7%C3%A3o-de-devs-inseguros-f3a95dde7e6c",
    category: "Article",
    thumb: ENEMThumb,
  },
];
