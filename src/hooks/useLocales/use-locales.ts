import { useState, useEffect, useCallback } from "react";
import i18n from "../../i18n";
import { Language } from "./use-locales.types";

export const useLocales = () => {
  const [language, setLanguage] = useState<Language>(i18n.language as Language);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => setLanguage(lng as Language);
    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, []);

  const setApplicationLanguage = useCallback((lng: Language) => {
    i18n.changeLanguage(lng);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang: Language = language === "en" ? "pt" : "en";
    i18n.changeLanguage(newLang);
  }, [language]);

  return { language, setApplicationLanguage, toggleLanguage };
};
