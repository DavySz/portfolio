import { memo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "../navigation-bar";
import { ExperienceRoot } from "../experience-root";
import { GravityMode } from "../gravity-mode";
import { isPlainLeftClick } from "../../hooks/useRoute/use-route";
import type { PageTemplateProps } from "./types";

export const PageTemplate: React.FC<PageTemplateProps> = memo(
  ({ children }) => {
    const { t } = useTranslation("component");
    const mainRef = useRef<HTMLElement>(null);

    /**
     * O pulo é de FOCO, não só de scroll.
     *
     * `<a href="#main-content">` sozinho rola a página mas não move o cursor
     * de teclado: `<main>` não é focável, então o próximo Tab voltava para o
     * segundo link do topo — exatamente o que o atalho existe para evitar. O
     * `tabIndex={-1}` torna o alvo focável por programa, e o clique é tratado
     * aqui para o fragmento não entrar na URL: dentro de um artigo,
     * `/artigos/<slug>#main-content` viraria uma "seção" daquele texto.
     */
    const skipToContent = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(event)) return;
      event.preventDefault();
      mainRef.current?.focus();
      mainRef.current?.scrollIntoView({ behavior: "instant" });
    };

    return (
      <div className="flex flex-col w-full h-full">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          onClick={skipToContent}
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
        {/* `outline-none` porque este foco é de destino, não de interação:
            quem chegou aqui pelo atalho já sabe onde está, e um contorno em
            volta da página inteira seria só ruído. */}
        <main
          id="main-content"
          role="main"
          ref={mainRef}
          tabIndex={-1}
          className="outline-none"
        >
          {children}
        </main>
        <GravityMode />
      </div>
    );
  },
);
