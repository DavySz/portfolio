import { useCallback, useEffect, useState } from "react";
import {
  DARK_QUERY,
  applyTheme,
  readStoredPreference,
  resolveTheme,
  storePreference,
  systemPrefersDark,
  type ResolvedTheme,
  type ThemePreference,
} from "../../shared/theme";

interface UseTheme {
  /** O que a pessoa escolheu: `system`, `light` ou `dark`. */
  preference: ThemePreference;
  /** O que está na tela agora. */
  theme: ResolvedTheme;
  select: (preference: ThemePreference) => void;
}

export const useTheme = (): UseTheme => {
  const [preference, setPreference] =
    useState<ThemePreference>(readStoredPreference);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  /*
   * Com `system` ativo, mudar o tema do sistema muda a página na hora, com a
   * aba aberta — que é o comportamento que "seguir o sistema" promete. Com
   * uma escolha explícita o listener continua rodando, mas o `resolveTheme`
   * ignora o sistema.
   */
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const theme = resolveTheme(preference, systemDark);

  /* O script do `index.html` já carimbou o tema antes do primeiro paint.
     Aqui o React só mantém em dia o que mudar depois disso. */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const select = useCallback((next: ThemePreference) => {
    setPreference(next);
    storePreference(next);
  }, []);

  return { preference, theme, select };
};
