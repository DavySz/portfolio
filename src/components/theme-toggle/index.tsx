import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { MdComputer, MdDarkMode, MdLightMode } from "react-icons/md";
import type { IconType } from "react-icons";
import { useTheme } from "../../hooks/useTheme/use-theme";
import type { ThemePreference } from "../../shared/theme";
import type { ThemeToggleProps } from "./types";

/**
 * Seletor de tema, três estados.
 *
 * Segue o mesmo desenho do seletor de idioma, por dois motivos: os dois são
 * controles da interface e não destinos, então ficam agrupados; e `aria-pressed`
 * é o mapeamento padrão de estado para `<button>` — `aria-current` descreve "o
 * item atual de um conjunto" e é idiomático em navegação, com links.
 *
 * `system` não é um terceiro tema, é a ausência de escolha: por isso ele existe
 * como opção explícita, e não só como o que acontece quando nada foi tocado.
 * Sem ele, quem clicou uma vez não teria como voltar a seguir o sistema.
 *
 * O nome do estado vai em `sr-only`, não em `aria-label`: `aria-label`
 * substituiria o conteúdo, e o ícone sozinho não é texto visível — então o
 * `sr-only` é o nome acessível, não um complemento dele.
 */
const OPTIONS: Array<{ value: ThemePreference; icon: IconType; key: string }> = [
  { value: "system", icon: MdComputer, key: "a11y.themeSystem" },
  { value: "light", icon: MdLightMode, key: "a11y.themeLight" },
  { value: "dark", icon: MdDarkMode, key: "a11y.themeDark" },
];

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { t } = useTranslation("component");
  const { preference, select } = useTheme();

  return (
    <div
      role="group"
      aria-label={t("a11y.theme")}
      className={clsx("flex items-center", className)}
    >
      {OPTIONS.map(({ value, icon: Icon, key }) => {
        const active = preference === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            aria-pressed={active}
            /* 44px de alvo mesmo com o realce menor, como no seletor de
               idioma. */
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <span
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-300",
                active
                  ? "bg-primary-500 text-white"
                  : "text-ink-muted hover:text-accent-strong"
              )}
            >
              <Icon size={16} aria-hidden="true" />
            </span>
            <span className="sr-only">{t(key)}</span>
          </button>
        );
      })}
    </div>
  );
};
