import { useTranslation } from "react-i18next";
import { CONTACTS } from "../../shared/constants";
import { Button } from "../button";
import { Link } from "../link";
import { Toggle } from "../toggle";
import { getLinks, SECTION_IDS } from "./constants";
import { useActiveSection } from "../../hooks/useActiveSection/use-active-section";

export const WebNavigationBar: React.FC = () => {
  const { t } = useTranslation("component");
  const active = useActiveSection(SECTION_IDS);

  const openLinkedin = (): void => {
    window.open(CONTACTS.LINKEDIN, "_blank");
  };

  return (
    <nav
      className="flex gap-8 w-full items-center xl:justify-end lg:justify-center py-6 md:px-[24px] xl:px-[100px]
                 bg-white/85 backdrop-blur-md border-b border-gray-100"
      role="navigation"
      aria-label={t("a11y.mainNavigation")}
    >
      {getLinks(t).map((link) => (
        <Link
          href={link.href}
          key={link.href}
          active={link.href === `#${active}`}
        >
          {link.label}
        </Link>
      ))}
      <Toggle />
      <Button onClick={openLinkedin} aria-label={t("a11y.hireOnLinkedIn")}>
        {t("navigation-bar.hire-me")}
      </Button>
    </nav>
  );
};
