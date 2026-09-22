import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  BASE_CLASSES,
  LABEL_CLASSES,
  labelClasses,
  shapeClasses,
  surfaceClasses,
} from "../button/styles";
import { CONTACT_SECTION_ID } from "../../shared/constants";
import { onMenuLinkClick, sectionHref } from "../../hooks/useRoute/use-route";
import type { ContactCtaProps } from "./types";

/**
 * O CTA principal do site.
 *
 * Antes levava direto para o LinkedIn: a ação mais destacada da página tirava
 * a pessoa do site antes de ela ter visto qualquer coisa, e o nome acessível
 * precisava avisar que abria em outra aba. Agora é âncora para o bloco de
 * contato, onde o LinkedIn continua sendo uma das opções — junto com e-mail e
 * telefone, que ficam no site.
 *
 * O destino é `/#contact`, com a raiz escrita: o CTA aparece no menu, que
 * também é servido dentro dos artigos. Como `#contact` puro, ali ele apontava
 * para uma seção inexistente daquele texto — a ação mais destacada do site
 * não fazia nada nas oito páginas de leitura.
 */
export const ContactCta: React.FC<ContactCtaProps> = ({
  full = false,
  onNavigate,
}) => {
  const { t } = useTranslation("component");
  const href = sectionHref(CONTACT_SECTION_ID);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    onMenuLinkClick(event, href);
    onNavigate?.();
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={clsx(
        BASE_CLASSES,
        surfaceClasses("primary"),
        shapeClasses("primary", true),
        full && "w-full"
      )}
    >
      <p className={clsx(LABEL_CLASSES, labelClasses("primary"))}>
        {t("navigation-bar.hire-me")}
      </p>
    </a>
  );
};
