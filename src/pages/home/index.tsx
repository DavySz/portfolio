import { Articles } from "./articles";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Projects } from "./projects";
import { Self } from "./self";
import { Services } from "./services";
import { Skills } from "./skills";
import { useSEO } from "../../hooks";
import { StructuredData } from "../../components/structured-data";
import { useTranslation } from "react-i18next";
import { useLocales } from "../../hooks/useLocales/use-locales";

export const Home: React.FC = () => {
  const { t } = useTranslation("home");
  const { language } = useLocales();

  useSEO({
    title: "Davy de Souza Assunção | Full Stack Developer",
    description: t("hero.description"),
    keywords:
      "davy de souza assuncao, davysz, full stack developer, react, react native, typescript, nodejs, javascript, frontend, backend, mobile, web development, brasil, manaus",
    image: "/images/user.jpeg",
    url: "https://davysz.com",
    type: "website",
  });

  return (
    <>
      <StructuredData locale={language === "pt" ? "pt-BR" : "en-US"} />
      <Hero />
      <Self />
      <Services />
      <Skills />
      <Projects />
      <Articles />
      <Footer />
    </>
  );
};
