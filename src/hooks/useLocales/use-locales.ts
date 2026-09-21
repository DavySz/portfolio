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

  /* Escolher explicitamente, não alternar: o seletor virou dois botões, e
     cada um sabe qual idioma representa. */
  const selectLanguage = useCallback((next: Language) => {
    // changeLanguage carrega o idioma antes de trocar: sem isso a tela
    // apareceria com as chaves cruas até o arquivo chegar.
    void changeLanguage(next);
  }, []);

  return { language, selectLanguage };
};
