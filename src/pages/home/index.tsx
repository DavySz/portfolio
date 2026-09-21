import { lazy, Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Hero } from "./hero";
import { useSEO } from "../../hooks";
import { StructuredData } from "../../components/structured-data";
import { Loading } from "../../components/loading";
import { useLocales } from "../../hooks/useLocales/use-locales";

// Lazy load sections for better performance
const Self = lazy(() =>
  import("./self").then((module) => ({ default: module.Self })),
);
const Services = lazy(() =>
  import("./services").then((module) => ({ default: module.Services })),
);
const Skills = lazy(() =>
  import("./skills").then((module) => ({ default: module.Skills })),
);
const Projects = lazy(() =>
  import("./projects").then((module) => ({ default: module.Projects })),
);
const Articles = lazy(() =>
  import("./articles").then((module) => ({ default: module.Articles })),
);
const Contact = lazy(() =>
  import("./contact").then((module) => ({ default: module.Contact })),
);
const Footer = lazy(() =>
  import("./footer").then((module) => ({ default: module.Footer })),
);

export const Home: React.FC = () => {
  const { t } = useTranslation("home");
  const { language } = useLocales();

  // useMemo porque o useSEO compara o objeto para decidir se mexe no <head>;
  // um literal novo a cada render faria o efeito rodar à toa.
  useSEO(
    useMemo(
      () => ({
        title: t("seo.title"),
        description: t("seo.description"),
        keywords: t("seo.keywords"),
        locale: language === "pt" ? "pt_BR" : "en_US",
      }),
      [t, language]
    )
  );

  const LoadingFallback = () => (
    <div className="flex justify-center items-center min-h-[200px]">
      <Loading size="lg" />
    </div>
  );

  return (
    <>
      <StructuredData locale={language === "pt" ? "pt-BR" : "en-US"} />
      <Hero />
      <Suspense fallback={<LoadingFallback />}>
        <Self />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Services />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Skills />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Projects />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Articles />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Contact />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
    </>
  );
};
