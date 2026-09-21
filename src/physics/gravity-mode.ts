/**
 * Estado do easter egg de gravidade.
 *
 * Módulo minúsculo e **sem importar física**: ele é carregado sempre, enquanto
 * o Rapier só entra por `import()` no momento da ativação. Quem nunca ativa
 * não paga nada além destas poucas linhas.
 */
type Listener = (active: boolean) => void;

const listeners = new Set<Listener>();
let active = false;

export const isGravityActive = (): boolean => active;

/**
 * O modo não é oferecido com prefers-reduced-motion: a página inteira
 * desabando é exatamente o tipo de movimento que a preferência pede para não
 * acontecer. Botão ausente e Konami ignorado.
 */
export const isGravityAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Avisa quando a preferência de movimento muda, para o botão sumir ou voltar
 * sem recarregar. Se ela for ligada com o modo ativo, desliga na hora: é
 * justamente esse movimento que a pessoa acabou de pedir para não acontecer.
 */
export const watchGravityAvailability = (
  listener: (available: boolean) => void
): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = (event: MediaQueryListEvent) => {
    const available = !event.matches;
    if (!available) setGravityActive(false);
    listener(available);
  };

  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

export const setGravityActive = (next: boolean): void => {
  if (active === next) return;
  if (next && !isGravityAvailable()) return;
  active = next;
  for (const listener of listeners) listener(active);
};

export const toggleGravity = (): void => setGravityActive(!active);

export const subscribeGravity = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** ↑ ↑ ↓ ↓ ← → ← → B A */
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Escuta o Konami code. Devolve a função de limpeza. */
export const listenForKonami = (onMatch: () => void): (() => void) => {
  let progress = 0;

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key !== KONAMI[progress]) {
      // recomeça, mas sem perder um acerto que já serve de primeiro passo
      progress = key === KONAMI[0] ? 1 : 0;
      return;
    }

    progress += 1;
    if (progress < KONAMI.length) return;

    progress = 0;
    onMatch();
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
};
