import type { ProjectCardProps } from "../../../components/project-card/types";
import BFFThumb from "../../../assets/bff-thumb.svg";
import ENEMThumb from "../../../assets/enem-thumb.png";
import TestingThumb from "../../../assets/testing-thumb.png";
import MicroThumb from "../../../assets/micro-thumb.png";
import type { TFunction } from "i18next";

export const getArticles = (
  t: TFunction<"home", undefined>
): ProjectCardProps[] => [
  {
    title: t("articles.items.bff.title"),
    link: "https://medium.com/@davysz/bff-por-que-o-frontend-deveria-liderar-essa-revolução-3b1f298be38a",
    category: "Article",
    thumb: BFFThumb,
  },
  {
    title: t("articles.items.enem.title"),
    link: "https://medium.com/@davysz/o-efeito-enem-no-código-como-estudar-para-passar-criou-uma-geração-de-devs-inseguros-f3a95dde7e6c",
    category: "Article",
    thumb: ENEMThumb,
  },
  {
    title: t("articles.items.testing.title"),
    link: "https://medium.com/@davysz/testes-unitários-no-frontend-arte-de-testar-o-que-importa-c4fdb27cebf1",
    category: "Article",
    thumb: TestingThumb,
  },
  {
    title: t("articles.items.micro.title"),
    link: "https://medium.com/@davysz/micro-frontends-divida-para-conquistar-77d59ff2bdcb",
    category: "Article",
    thumb: MicroThumb,
  },
];
