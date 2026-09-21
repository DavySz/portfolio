import { useTranslation } from "react-i18next";
import { CONTACTS } from "../../shared/constants";
import { Button } from "../button";
import { Link } from "../link";
import { Toggle } from "../toogle";
import { getLinks } from "./constants";

export const WebNavigationBar: React.FC = () => {
  const { t } = useTranslation("component");

  const openLinkedin = (): void => {
    window.open(CONTACTS.LINKEDIN, "_blank");
  };

  return (
    <nav
      className="flex gap-8 w-full items-center xl:justify-end lg:justify-center py-8 md:px-[24px] mb:px-[100px] xl:px-[100px]"
      role="navigation"
      aria-label={t("a11y.mainNavigation")}
    >
      {getLinks(t).map((link) => (
        <Link href={link.href} key={link.href}>
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
