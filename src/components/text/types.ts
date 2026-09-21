import type { TypographyClass } from "../../shared/typography-tokens";

export interface TextProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  variant?: TypographyClass;
  color?:
    | "primary"
    | "secondary"
    | "muted"
    | "subtle"
    | "accent"
    | "accentLight"
    | "gradient"
    | "gradientLight"
    | "white";
  align?: "left" | "center" | "right" | "justify";
  className?: string;
  children: React.ReactNode;
}

