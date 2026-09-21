import { useEffect, useRef, useState } from "react";
import { Button } from "../button";
import { ContactCta } from "../contact-cta";
import { Toggle } from "../toggle";
import { ThemeToggle } from "../theme-toggle";
import { getLinks, SECTION_IDS } from "./constants";
import { FiMenu } from "react-icons/fi";
import type { IconType } from "react-icons";
import { AiOutlineClose } from "react-icons/ai";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useActiveSection } from "../../hooks/useActiveSection/use-active-section";

const MENU_ID = "mobile-menu";
const TRIGGER_ID = "mobile-menu-trigger";
/** O conteúdo da página, que fica atrás do painel. */
const PAGE_CONTENT_ID = "main-content";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * `inert` tira a subárvore inteira da ordem de foco e do leitor de tela.
 * Os tipos do React 18 não conhecem o atributo (só a 19 conhece), mas em
 * minúsculas ele é repassado direto ao DOM — mesmo caso do `fetchpriority`
 * no hero. Ausente quando o menu está aberto; presente quando fechado.
 */
const inertWhenClosed = (closed: boolean) =>
  (closed ? { inert: "" } : {}) as Record<string, string>;

interface ScrollLock {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyTouchAction: string;
}

/**
 * Trava o scroll guardando o que estava lá antes, como em
 * `src/physics/gravity-world.ts`.
 *
 * A versão anterior aplicava `position: fixed` no body sem salvar o `scrollY`.
 * Isso tira o body do fluxo e o reposiciona na origem: abrir o menu no meio da
 * página jogava tudo para o topo, e fechar não devolvia a posição. `overflow`
 * mais `touch-action` seguram o scroll — inclusive o de toque no iOS, que
 * ignora `overflow: hidden` sozinho — sem mexer no fluxo, então não há posição
 * a restaurar.
 */
const lockScroll = (): ScrollLock => {
  const lock: ScrollLock = {
    htmlOverflow: document.documentElement.style.overflow,
    bodyOverflow: document.body.style.overflow,
    bodyTouchAction: document.body.style.touchAction,
  };
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
  return lock;
};

/** Devolve os valores anteriores, em vez de chutar `auto`. */
const restoreScroll = (lock: ScrollLock): void => {
  document.documentElement.style.overflow = lock.htmlOverflow;
  document.body.style.overflow = lock.bodyOverflow;
  document.body.style.touchAction = lock.bodyTouchAction;
};

export const MobileNavigationBar: React.FC = () => {
  const { t } = useTranslation("component");
  const [isVisible, setIsVisible] = useState(false);
  /* O mesmo scroll-spy do desktop. Antes isto era um `useState("/")` que só
     guardava o último clique: começava num valor que nenhum link casa e
     ficava desatualizado assim que a pessoa rolava a página. */
  const active = useActiveSection(SECTION_IDS);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleOptions = (): void => {
    setIsVisible((prev) => !prev);
  };

  const getIcon = (): IconType => {
    return isVisible ? AiOutlineClose : FiMenu;
  };

  const handleSelectOption = (): void => {
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

  /**
   * Contrato de diálogo modal: foco entra, fica preso e volta.
   *
   * O painel já declarava `role="dialog"` e `aria-modal="true"`, mas o foco
   * continuava no hambúrguer — que está FORA do diálogo. Como `aria-modal`
   * esconde o resto da página do leitor de tela, a pessoa ficava com o foco
   * num elemento que, para ela, tinha deixado de existir.
   *
   * O `inert` vai no conteúdo da página, não na barra do topo: o ícone do
   * hambúrguer vira um X enquanto o menu está aberto e continua sendo o
   * caminho de fechar para quem usa mouse. Quem usa teclado fecha pelo botão
   * do painel ou pelo Esc, e o Tab não chega até lá.
   */
  useEffect(() => {
    if (!isVisible) return;

    const panel = panelRef.current;
    if (!panel) return;

    const content = document.getElementById(PAGE_CONTENT_ID);
    content?.setAttribute("inert", "");

    const focusables = (): HTMLElement[] =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.getClientRects().length > 0
      );

    // O primeiro focável do painel é o botão de fechar.
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const escaped = !(current instanceof Node) || !panel.contains(current);

      if (event.shiftKey && (escaped || current === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (escaped || current === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      content?.removeAttribute("inert");
      // Fechar pelo botão, pelo Esc ou por um link devolve o foco a quem abriu.
      document.getElementById(TRIGGER_ID)?.focus();
    };
  }, [isVisible]);

  // Trava só enquanto o menu está aberto. Antes isto rodava na montagem
  // mesmo com o menu fechado, escrevendo estilo inline no body sem motivo.
  useEffect(() => {
    if (!isVisible) return;
    const lock = lockScroll();
    return () => restoreScroll(lock);
  }, [isVisible]);

  return (
    <>
      {/* Header Bar */}
      <div className="relative z-50 flex items-center justify-between w-full py-4 px-6 bg-page/95 backdrop-blur-sm border-b border-line">
        <div className="flex items-center gap-1">
          <Toggle />
          <ThemeToggle />
        </div>
        <Button
          id={TRIGGER_ID}
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
        ref={panelRef}
        id={MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label={t("a11y.menuTitle")}
        /* Fechado o painel continua no DOM para animar, mas precisa sair da
           ordem de tabulação — senão o Tab passeia por links invisíveis. */
        {...inertWhenClosed(!isVisible)}
        className={clsx(
          "fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50",
          "bg-surface-raised shadow-2xl shadow-black/20 dark:shadow-none dark:border-l dark:border-line",
          "transform transition-all duration-300 ease-out",
          {
            "translate-x-0": isVisible,
            "translate-x-full": !isVisible,
          }
        )}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-line">
          <h3 className="text-lg font-semibold text-ink">
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
                    aria-current={
                      link.href === `#${active}` ? "true" : undefined
                    }
                    onClick={handleSelectOption}
                    className={clsx(
                      "flex items-center px-6 py-4 text-base font-medium transition-all duration-200",
                      "hover:bg-accent/10 hover:text-accent-strong",
                      "border-l-4 transition-all duration-200",
                      {
                        "border-primary-500 bg-accent/10 text-accent-strong":
                          link.href === `#${active}`,
                        "border-transparent text-ink-secondary hover:border-primary-200":
                          link.href !== `#${active}`,
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
          <div className="p-6 border-t border-line bg-surface">
            <ContactCta full onNavigate={handleSelectOption} />
          </div>
        </div>
      </div>
    </>
  );
};
