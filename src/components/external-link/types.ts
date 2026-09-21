import type { ButtonVariant } from "../button/types";

export interface ExternalLinkProps {
  href: string;
  variant?: ButtonVariant;
  icon?: React.ElementType;
  full?: boolean;
  /** Nome acessível quando não há texto visível (links só de ícone). */
  label?: string;
  children?: React.ReactNode;
}
