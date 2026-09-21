import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import homeEn from "../pages/home/locales/en.json";
import componentEn from "../components/locales/en.json";

/**
 * O site é bilíngue, mas ninguém lê os dois idiomas ao mesmo tempo.
 *
 * Antes os quatro arquivos de locale entravam estaticamente no bundle, então
 * todo visitante baixava tradução que nunca usaria — 2.212 B gzip, mais do que
 * a camada 3D inteira acrescentou ao caminho inicial.
 *
 * Agora só o inglês vem embutido, porque é o padrão e o fallback: quem chega
 * nele não espera nada. O português entra por `import()`, e a primeira pintura
 * só é adiada quando ele é de fato o idioma escolhido.
 */
export type Language = "en" | "pt";

const STORAGE_KEY = "davysz:language";
const FALLBACK: Language = "en";

/** Ordem: escolha salva > idioma do navegador > inglês. */
const detectLanguage = (): Language => {
  if (typeof window === "undefined") return FALLBACK;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "pt") return saved;
  } catch {
    // modo privado: segue para o idioma do navegador
  }

  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : FALLBACK;
};

i18n.use(initReactI18next).init({
  resources: {
    en: { home: homeEn, component: componentEn },
  },
  lng: FALLBACK,
  fallbackLng: FALLBACK,
  interpolation: { escapeValue: false },
});

const loaded = new Set<Language>([FALLBACK]);
const loading = new Map<Language, Promise<void>>();

const loadResources = (language: Language): Promise<void> => {
  if (loaded.has(language)) return Promise.resolve();

  const pending = loading.get(language);
  if (pending) return pending;

  const task = Promise.all([
    import(`../pages/home/locales/${language}.json`),
    import(`../components/locales/${language}.json`),
  ])
    .then(([home, component]) => {
      i18n.addResourceBundle(language, "home", home.default);
      i18n.addResourceBundle(language, "component", component.default);
      loaded.add(language);
    })
    .catch(() => {
      // Sem a tradução, o fallback em inglês continua legível. Falhar aqui
      // não pode derrubar a página.
    })
    .finally(() => {
      loading.delete(language);
    });

  loading.set(language, task);
  return task;
};

/** Carrega o idioma se preciso e então troca — nunca deixa a tela em chaves. */
export const changeLanguage = async (language: Language): Promise<void> => {
  await loadResources(language);
  await i18n.changeLanguage(language);
};

/**
 * Resolve o idioma inicial antes do primeiro render.
 *
 * Em inglês isto resolve sem rede nenhuma; só quem chega em português paga uma
 * requisição, e paga para não ver a tela piscar de um idioma para o outro.
 */
export const ensureInitialLanguage = (): Promise<void> => {
  const language = detectLanguage();
  if (language === FALLBACK) return Promise.resolve();
  return changeLanguage(language);
};

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
