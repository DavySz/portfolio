import { useEffect, useState } from "react";
import {
  prefersReducedMotion,
  watchReducedMotion,
} from "../../experience/quality";

/**
 * A preferência de movimento, reagindo à troca em runtime.
 *
 * Reaproveita o `watchReducedMotion` do `experience/quality.ts`, que já é o
 * dono da media query e é importado estaticamente — não há custo novo de
 * bundle, e a string da query continua existindo num lugar só.
 *
 * O CSS global já zera animação e `scroll-behavior` sob a preferência, mas
 * `scrollIntoView({ behavior: "smooth" })` passa por cima do CSS: a opção
 * dada em JS tem precedência. Onde o comportamento é decidido em código,
 * quem decide precisa perguntar.
 */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => watchReducedMotion((animate) => setReduced(!animate)), []);

  return reduced;
};
