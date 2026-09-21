import { useState, useEffect, useCallback } from "react";
import i18n, { changeLanguage } from "../../i18n";
import type { Language } from "./use-locales.types";

export const useLocales = () => {
  const [language, setLanguage] = useState<Language>(i18n.language as Language);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => setLanguage(lng as Language);
    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, []);

  const toggleLanguage = useCallback(() => {
    const next: Language = language === "en" ? "pt" : "en";
    // changeLanguage carrega o idioma antes de trocar: sem isso a tela
    // apareceria com as chaves cruas até o arquivo chegar.
    void changeLanguage(next);
  }, [language]);

  return { language, toggleLanguage };
};
