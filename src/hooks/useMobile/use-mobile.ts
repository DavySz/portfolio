import { useEffect, useState } from "react";

/**
 * Abaixo de `xl` a navegação vira o menu de painel.
 *
 * O valor casa com o breakpoint `xl` do Tailwind de propósito: antes o hook
 * trocava em 769px enquanto o hero só virava linha em 1280, e entre os dois
 * o site mostrava a navegação de desktop com o hero empilhado — um estado que
 * ninguém desenhou.
 *
 * `matchMedia` em vez de listener de `resize`: o navegador avisa só quando a
 * condição vira, em vez de disparar a cada pixel arrastado.
 */
const DESKTOP_QUERY = "(min-width: 1280px)";

export const useMobile = (query: string = DESKTOP_QUERY) => {
  const [isMobile, setIsMobile] = useState(
    () => !window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(!event.matches);

    setIsMobile(!media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return { isMobile };
};
