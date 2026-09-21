import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useLocales } from "../../hooks/useLocales/use-locales";
import type { Language } from "../../hooks/useLocales/use-locales.types";
import type { ToggleProps } from "./types";

/**
 * Seletor de idioma.
 *
 * Era um switch cujo único conteúdo visível era 🇺🇸 ou 🇧🇷. Bandeira representa
 * país, não língua — o inglês do site não é "dos EUA", e português não é
 * exclusivo do Brasil. Pior: o formato de switch é o vocabulário de
 * liga/desliga, o mesmo de um toggle de tema escuro, então não dava para saber
 * o que ele fazia sem passar o mouse e ler o `title`.
 *
 * Agora são dois botões com o código do idioma. O ativo fica destacado e
 * declara `aria-pressed`, que é o mapeamento padrão de estado para `<button>`
 * — `aria-current` descreve "o item atual de um conjunto" e é idiomático em
 * navegação, com links, não em botões de alternar.
 *
 * O nome de cada idioma vai em `sr-only` em vez de `aria-label`: `aria-label`
 * substituiria o texto visível, e o nome acessível precisa conter o que está
 * escrito na tela (WCAG 2.5.3). Os nomes ficam no próprio idioma, que é a
 * convenção de um seletor — quem procura português não lê "Portuguese".
 */

const LANGUAGES: Array<{ code: Language; code2: string; name: string }> = [
  { code: "en", code2: "EN", name: "English" },
  { code: "pt", code2: "PT", name: "Português" },
];

export const Toggle: React.FC<ToggleProps> = ({ className }) => {
  const { t } = useTranslation("component");
  const { language, selectLanguage } = useLocales();

  return (
    <div
      role="group"
      aria-label={t("a11y.language")}
      className={clsx("flex items-center", className)}
    >
      {LANGUAGES.map(({ code, code2, name }) => {
        const active = language === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => selectLanguage(code)}
            aria-pressed={active}
            /* O alvo de toque tem 44px mesmo com o realce menor: o switch
               antigo tinha 28px de altura. */
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <span
              className={clsx(
                "rounded-md px-2 py-1 font-poppins text-body-sm font-semibold transition-colors duration-300",
                active
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:text-primary-700"
              )}
            >
              {code2}
            </span>
            <span className="sr-only">{name}</span>
          </button>
        );
      })}
    </div>
  );
};
