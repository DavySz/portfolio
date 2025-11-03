import React from "react";
import clsx from "clsx";
import {
  typographyClasses,
  type TypographyClass,
} from "../../shared/typography-tokens";

interface TextProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  variant?: TypographyClass;
  color?:
    | "primary"
    | "secondary"
    | "muted"
    | "subtle"
    | "accent"
    | "gradient"
    | "white";
  align?: "left" | "center" | "right" | "justify";
  className?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Text: React.FC<TextProps> = ({
  as: Component = "p",
  variant,
  color = "primary",
  align = "left",
  className,
  children,
  maxWidth,
  ...props
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
      case "gradient":
        return "bg-gradient-to-tr from-primary-500 to-primary-900 bg-clip-text text-transparent";
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

  const style = maxWidth ? { maxWidth } : undefined;

  return (
    <Component className={classes} style={style} {...props}>
      {children}
    </Component>
  );
};
