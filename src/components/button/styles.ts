import type { ButtonVariant } from "./types";

/**
 * Estilo compartilhado entre `Button` e `ExternalLink`.
 *
 * Um link que sai do site precisa ser `<a>`, não `<button>` — mas precisa
 * parecer exatamente o botão de sempre. Com as classes num lugar só, os dois
 * não têm como divergir com o tempo.
 */

export const BASE_CLASSES = [
  "flex gap-2 rounded-3xl items-center justify-center relative overflow-hidden group",
  "transition-all duration-300 ease-out",
  "transform hover:scale-105 active:scale-95",
  // focus-visible, não focus: com `focus` o anel aparecia também no clique
  // de mouse. Link, ArticleCard, ProjectCard e SkillCard já usavam assim.
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
].join(" ");

export const surfaceClasses = (variant: ButtonVariant): string => {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-900 hover:from-primary-400 hover:to-primary-800 shadow-primary hover:shadow-primary-hover",
    secondary:
      "bg-transparent border border-primary-500 hover:bg-primary-500/10 hover:border-primary-400 hover:shadow-primary",
    tertiary: "bg-transparent hover:bg-white/5",
    // Superfície escura (fundo do experience): borda primary-200 = 4.60:1
    // sobre o ponto mais claro do shader, acima dos 3:1 exigidos para UI.
    onDark:
      "bg-transparent border border-primary-200 hover:bg-white/10 hover:border-white hover:shadow-primary",
  };

  return variants[variant];
};

export const labelClasses = (variant: ButtonVariant): string => {
  const variants: Record<ButtonVariant, string> = {
    primary: "text-white",
    tertiary: "text-white hover:text-primary-300",
    secondary: "text-accent-strong hover:text-accent",
    // primary-100 = 5.79:1 sobre o ponto mais claro do shader (AA).
    onDark: "text-primary-100 hover:text-white",
  };

  return variants[variant];
};

export const shapeClasses = (
  variant: ButtonVariant,
  hasLabel: boolean
): string => {
  if (!hasLabel && variant !== "tertiary") return "p-4 rounded-full";
  if (variant === "tertiary") return "";
  return "py-2 px-8";
};

export const iconColor = (variant: ButtonVariant): string => {
  if (variant === "tertiary") return "#FFFFFF";
  if (variant === "onDark") return "#E9E3FF"; // primary-100
  return "#7041CF";
};

export const LABEL_CLASSES =
  "font-poppins font-semibold xl:text-xl text-base transition-colors duration-300";
