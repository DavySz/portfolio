import { memo } from "react";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "../navigation-bar";
import { ExperienceRoot } from "../experience-root";
import { GravityMode } from "../gravity-mode";
import type { PageTemplateProps } from "./types";

export const PageTemplate: React.FC<PageTemplateProps> = memo(
  ({ children }) => {
    const { t } = useTranslation("component");

    return (
      <div className="flex flex-col w-full h-full">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary-600 focus:text-white"
        >
          {t("a11y.skipToContent")}
        </a>
        {/* Canvas único atrás da página inteira. Depois do skip link, que
            precisa continuar sendo o primeiro elemento focável. */}
        <ExperienceRoot />
        {/* Sticky: numa página de 7 seções mais artigos longos, perder a
            navegação ao rolar obriga a voltar tudo. z-40 fica acima do
            conteúdo e abaixo do painel do menu mobile (z-50). */}
        <div className="sticky top-0 z-40">
          <NavigationBar />
        </div>
        <main id="main-content" role="main">
          {children}
        </main>
        <GravityMode />
      </div>
    );
  },
);
