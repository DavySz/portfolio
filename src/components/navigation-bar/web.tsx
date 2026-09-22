import { useTranslation } from "react-i18next";
import { ContactCta } from "../contact-cta";
import { Link } from "../link";
import { Toggle } from "../toggle";
import { ThemeToggle } from "../theme-toggle";
import { getLinks, SECTION_IDS } from "./constants";
import { useActiveSection } from "../../hooks/useActiveSection/use-active-section";
import {
  onMenuLinkClick,
  sectionHref,
  useIsHome,
} from "../../hooks/useRoute/use-route";

export const WebNavigationBar: React.FC = () => {
  const { t } = useTranslation("component");
  const isHome = useIsHome();
  // Dentro de um artigo nenhuma seção da home está montada: procurar por elas
  // ali é trabalho que nunca termina.
  const active = useActiveSection(SECTION_IDS, isHome);

  return (
    <nav
      /* `gap-6` e `text-lg` a partir de xl: medindo os avanços reais da
         Poppins, a nav em português precisava de 1.099px contra 1.080px
         disponíveis a 1280px — já estourava antes do botão de tema existir.
         Ver DARK-MODE.md §6. */
      className="flex gap-6 w-full items-center justify-end py-6 px-[24px] 2xl:px-[100px]
                 bg-page/85 backdrop-blur-md border-b border-line"
      role="navigation"
      aria-label={t("a11y.mainNavigation")}
    >
      {getLinks(t).map((link) => (
        <Link
          href={link.href}
          key={link.href}
          onClick={(event) => onMenuLinkClick(event, link.href)}
          active={active !== null && link.href === sectionHref(active)}
        >
          {link.label}
        </Link>
      ))}
      {/* Idioma e tema são controles da interface, não destinos: ficam
          agrupados e separados dos links, e colados entre si. */}
      <div className="flex items-center gap-1">
        <Toggle />
        <ThemeToggle />
      </div>
      <ContactCta />
    </nav>
  );
};
