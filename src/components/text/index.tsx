import React from "react";
import clsx from "clsx";
import { typographyClasses } from "../../shared/typography-tokens";
import type { TextProps } from "./types";

export const Text: React.FC<TextProps> = ({
  as: Component = "p",
  variant,
  color = "primary",
  align = "left",
  className,
  children,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "text-ink";
      case "secondary":
        return "text-ink-secondary";
      case "muted":
        return "text-ink-muted";
      case "subtle":
        return "text-ink-muted";
      case "accent":
        return "text-accent";
      // Variantes para superfície escura (fundo do experience). Contraste sobre
      // o ponto mais claro do shader (#653bbe): primary-200 = 4.60:1 (AA).
      case "accentLight":
        return "text-primary-200";
      /* Q1 do DARK-MODE.md: no escuro a ponta `primary-900` do gradiente fica
         a 1,34:1 do fundo — ilegível. Não é um valor que um token resolva: é
         um PAR de cores, então o componente troca de variante. No escuro usa o
         mesmo tratamento que o hero já usava sobre superfície escura. */
      case "gradient":
        return clsx(
          "bg-clip-text text-transparent",
          "bg-gradient-to-tr from-primary-500 to-primary-900",
          "dark:from-white dark:to-primary-200"
        );
      case "gradientLight":
        return "bg-gradient-to-tr from-white to-primary-200 bg-clip-text text-transparent";
      case "white":
        return "text-white";
      default:
        return "text-ink";
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case "left":
        return "text-left";
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "justify":
        return "text-justify";
      default:
        return "text-left";
    }
  };

  const classes = clsx(
    "font-poppins",
    variant && typographyClasses[variant],
    getColorClasses(),
    getAlignClasses(),
    className
  );

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};
