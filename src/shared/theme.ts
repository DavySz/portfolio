/**
 * Resolução do tema.
 *
 * Lógica pura, sem React e sem DOM além do `matchMedia`, para poder ser
 * testada e para o script anti-flash do `index.html` poder repetir a mesma
 * regra em três linhas sem importar nada.
 */

/** O que a pessoa escolheu. `system` é o padrão e significa "não escolhi". */
export type ThemePreference = "system" | "light" | "dark";

/** O que a tela mostra de fato. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "davysz:theme";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

const PREFERENCES: ThemePreference[] = ["system", "light", "dark"];

export const isThemePreference = (
  value: unknown
): value is ThemePreference =>
  typeof value === "string" &&
  (PREFERENCES as string[]).includes(value);

/**
 * Lê a preferência salva.
 *
 * Valor ausente, corrompido ou de uma versão antiga cai em `system`: um tema
 * inválido não pode deixar a pessoa sem site.
 */
export const readStoredPreference = (): ThemePreference => {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    // modo privado: a escolha vale só para esta sessão
    return "system";
  }
};

export const storePreference = (preference: ThemePreference): void => {
  if (typeof window === "undefined") return;
  try {
    if (preference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // idem: a troca acontece, só não sobrevive à aba
  }
};

/** Escolha explícita ganha do sistema; sem escolha, o sistema decide. */
export const resolveTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme => {
  if (preference === "light" || preference === "dark") return preference;
  return systemPrefersDark ? "dark" : "light";
};

export const systemPrefersDark = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;

/**
 * Carimba o tema no documento.
 *
 * A classe é o que o Tailwind lê (`darkMode: "class"`); o `color-scheme`
 * inline é o que os controles nativos leem. Os dois precisam andar juntos.
 */
export const applyTheme = (theme: ResolvedTheme): void => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
};
