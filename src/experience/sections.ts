/**
 * Registro de seções que querem uma cena do experience.
 *
 * Este módulo é importado pelo React (via useExperienceSection) e **não pode
 * importar three**: as seções se registram muito antes de o núcleo carregar,
 * e o núcleo lê o registro quando estiver pronto.
 */
type SectionListener = () => void;

const sections = new Map<string, HTMLElement>();
const listeners = new Set<SectionListener>();

const notify = (): void => {
  for (const listener of listeners) listener();
};

export const registerSection = (id: string, element: HTMLElement): void => {
  sections.set(id, element);
  notify();
};

export const unregisterSection = (id: string): void => {
  if (sections.delete(id)) notify();
};

export const getSections = (): ReadonlyMap<string, HTMLElement> => sections;

/** Avisa o núcleo quando uma seção entra ou sai, para ele remedir os rects. */
export const subscribeSections = (listener: SectionListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
