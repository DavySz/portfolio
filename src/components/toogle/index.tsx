import React from "react";
import clsx from "clsx";
import { useLocales } from "../../hooks/useLocales/use-locales";
import type { ToggleProps } from "./types";

export const Toggle: React.FC<ToggleProps> = ({ className }) => {
  const { language, toggleLanguage } = useLocales();

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <button
        onClick={toggleLanguage}
        className={clsx(
          "relative w-14 h-7 rounded-full transition-all duration-500 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50",
          "shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95",
          "group overflow-hidden",
          {
            "bg-gradient-to-r from-primary-500 to-primary-900":
              language === "en",
            "bg-gray-600 hover:bg-gray-500": language === "pt",
          }
        )}
        aria-label={`Mudar idioma para ${
          language === "en" ? "Português" : "English"
        }`}
        title={`Mudar idioma para ${
          language === "en" ? "Português" : "English"
        }`}
      >
        {/* Background glow effect */}
        <div
          className={clsx(
            "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            {
              "bg-gradient-to-r from-primary-400 to-primary-800":
                language === "en",
              "bg-gray-500": language === "pt",
            }
          )}
        />

        <div
          className={clsx(
            "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ease-out",
            "flex items-center justify-center z-10",
            "group-hover:shadow-xl group-hover:scale-110",
            {
              "transform translate-x-7": language === "en",
              "transform translate-x-0.5": language === "pt",
            }
          )}
        >
          <span
            className={clsx(
              "text-xs transition-transform duration-300 ease-out",
              "group-hover:scale-110 group-active:animate-bounce-gentle"
            )}
          >
            {language === "en" ? "🇺🇸" : "🇧🇷"}
          </span>
        </div>
      </button>
    </div>
  );
};
