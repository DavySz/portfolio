import React from "react";
import clsx from "clsx";
import { useLocales } from "../../hooks/useLocales/use-locales";
import { ToggleProps } from "./types";

export const Toggle: React.FC<ToggleProps> = ({ className }) => {
  const { language, toggleLanguage } = useLocales();

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <button
        onClick={toggleLanguage}
        className={clsx(
          "relative w-14 h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7947DF] focus:ring-opacity-50 shadow-md",
          {
            "bg-gradient-to-r from-[#7947DF] to-[#311961]": language === "en",
            "bg-gray-600": language === "pt",
          }
        )}
        aria-label={`Mudar idioma para ${
          language === "en" ? "Português" : "English"
        }`}
        title={`Mudar idioma para ${
          language === "en" ? "Português" : "English"
        }`}
      >
        <div
          className={clsx(
            "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center",
            {
              "transform translate-x-7": language === "en",
              "transform translate-x-0.5": language === "pt",
            }
          )}
        >
          <span className="text-xs">{language === "en" ? "🇺🇸" : "🇧🇷"}</span>
        </div>
      </button>
    </div>
  );
};
