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
        return "text-gray-900";
      case "secondary":
        return "text-gray-700";
      case "muted":
        return "text-gray-600";
      case "subtle":
        return "text-gray-500";
      case "accent":
        return "text-primary-600";
      // Variantes para superfície escura (fundo do experience). Contraste sobre
      // o ponto mais claro do shader (#653bbe): primary-200 = 4.60:1 (AA).
      case "accentLight":
        return "text-primary-200";
      case "gradient":
        return "bg-gradient-to-tr from-primary-500 to-primary-900 bg-clip-text text-transparent";
      case "gradientLight":
        return "bg-gradient-to-tr from-white to-primary-200 bg-clip-text text-transparent";
      case "white":
        return "text-white";
      default:
        return "text-gray-900";
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
