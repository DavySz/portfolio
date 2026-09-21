import { useCallback } from "react";
import {
  registerSection,
  unregisterSection,
} from "../../experience/sections";

/**
 * Devolve um ref callback que registra a seção no experience enquanto ela
 * estiver montada. Não puxa three para o bundle inicial.
 */
export const useExperienceSection = (id: string) =>
  useCallback(
    (element: HTMLElement | null) => {
      if (element) registerSection(id, element);
      else unregisterSection(id);
    },
    [id]
  );
