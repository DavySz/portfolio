import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import homeEn from "../pages/home/locales/en.json";
import homePt from "../pages/home/locales/pt.json";
import componentPt from "../components/locales/pt.json";
import componentEn from "../components/locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { home: homeEn, component: componentEn },
    pt: { home: homePt, component: componentPt },
  },
  lng: "en",
  fallbackLng: "pt",
  interpolation: { escapeValue: false },
});

export default i18n;
