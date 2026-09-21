import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import homeEn from "../pages/home/locales/en.json";
import homePt from "../pages/home/locales/pt.json";
import componentPt from "../components/locales/pt.json";
import componentEn from "../components/locales/en.json";

const STORAGE_KEY = "davysz:language";

/** Ordem: escolha salva > idioma do navegador > inglês. */
const initialLanguage = (): string => {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "pt") return saved;
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { home: homeEn, component: componentEn },
    pt: { home: homePt, component: componentPt },
  },
  lng: initialLanguage(),
  fallbackLng: "pt",
  interpolation: { escapeValue: false },
});

/**
 * Mantém o `lang` do documento em dia e guarda a escolha.
 *
 * O `lang` estava fixo em pt-BR no HTML enquanto o site abria em inglês, o que
 * faz leitor de tela ler com a fonética errada e o buscador indexar o idioma
 * errado. Aqui ele passa a seguir o idioma de verdade, inclusive na troca.
 */
const syncDocumentLanguage = (language: string): void => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
};

syncDocumentLanguage(i18n.language);

i18n.on("languageChanged", (language) => {
  syncDocumentLanguage(language);
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // modo privado ou storage cheio: a troca vale só para esta sessão
  }
});

export default i18n;
