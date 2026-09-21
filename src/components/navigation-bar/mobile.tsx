import { useCallback, useEffect, useState } from "react";
import { CONTACTS } from "../../shared/constants";
import { Button } from "../button";
import { Toggle } from "../toogle";
import { getLinks } from "./constants";
import { FiMenu } from "react-icons/fi";
import type { IconType } from "react-icons";
import { AiOutlineClose } from "react-icons/ai";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

const MENU_ID = "mobile-menu";

/**
 * `inert` tira a subárvore inteira da ordem de foco e do leitor de tela.
 * Os tipos do React 18 não conhecem o atributo (só a 19 conhece), mas em
 * minúsculas ele é repassado direto ao DOM — mesmo caso do `fetchpriority`
 * no hero. Ausente quando o menu está aberto; presente quando fechado.
 */
const inertWhenClosed = (closed: boolean) =>
  (closed ? { inert: "" } : {}) as Record<string, string>;

export const MobileNavigationBar: React.FC = () => {
  const { t } = useTranslation("component");
  const [isVisible, setIsVisible] = useState(false);
  const [activeLink, setActiveLink] = useState<string>("/");

  const toggleOptions = (): void => {
    setIsVisible((prev) => !prev);
  };

  const openLinkedin = () => {
    window.open(CONTACTS.LINKEDIN, "_blank");
  };

  const getIcon = (): IconType => {
    return isVisible ? AiOutlineClose : FiMenu;
  };

  const handleSelectOption = (href: string): void => {
    setActiveLink(href);
    toggleOptions();
  };

  // Esc fecha o menu: é o atalho que todo mundo tenta primeiro num painel.
  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible]);

  const disableScrollY = useCallback((): void => {
    if (isVisible) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.body.style.touchAction = "none";
    } else {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
      document.body.style.height = "auto";
      document.body.style.touchAction = "auto";
    }
  }, [isVisible]);

  const enableScrollY = () => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.position = "static";
    document.body.style.width = "auto";
    document.body.style.height = "auto";
    document.body.style.touchAction = "auto";
  };

  useEffect(() => {
    disableScrollY();
    return enableScrollY;
  }, [disableScrollY]);

  return (
    <>
      {/* Header Bar */}
      <div className="relative z-50 flex items-center justify-between w-full py-4 px-6 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <Toggle />
        <Button
          variant="secondary"
          icon={getIcon()}
          onClick={toggleOptions}
          aria-label={t(isVisible ? "a11y.closeMenu" : "a11y.openMenu")}
          aria-expanded={isVisible}
          aria-controls={MENU_ID}
        />
      </div>

      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 
                     transition-all duration-300 ease-out"
          onClick={toggleOptions}
        />
      )}

      {/* Slide-in Menu Panel */}
      <div
        id={MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label={t("a11y.menuTitle")}
        /* Fechado o painel continua no DOM para animar, mas precisa sair da
           ordem de tabulação — senão o Tab passeia por links invisíveis. */
        {...inertWhenClosed(!isVisible)}
        className={clsx(
          "fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50",
          "bg-white shadow-2xl shadow-black/20",
          "transform transition-all duration-300 ease-out",
          {
            "translate-x-0": isVisible,
            "translate-x-full": !isVisible,
          }
        )}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-secondary-900">
            {t("a11y.menuTitle")}
          </h3>
          <Button
            variant="tertiary"
            icon={AiOutlineClose}
            onClick={toggleOptions}
            aria-label={t("a11y.closeMenu")}
          />
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <nav className="flex-1 py-6">
            <ul className="space-y-2">
              {getLinks(t).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => handleSelectOption(link.href)}
                    className={clsx(
                      "flex items-center px-6 py-4 text-base font-medium transition-all duration-200",
                      "hover:bg-primary-50 hover:text-primary-700",
                      "border-l-4 transition-all duration-200",
                      {
                        "border-primary-500 bg-primary-50 text-primary-700":
                          activeLink === link.href,
                        "border-transparent text-gray-700 hover:border-primary-200":
                          activeLink !== link.href,
                      }
                    )}
                  >
                    <span className="transform transition-transform duration-200 hover:translate-x-1">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Action */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <Button
              onClick={() => {
                openLinkedin();
                toggleOptions();
              }}
              full
            >
              {t("navigation-bar.hire-me")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
