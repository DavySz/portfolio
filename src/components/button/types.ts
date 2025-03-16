export type ButtonVariant = "primary" | "secondary" | "tertiary";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  variant?: ButtonVariant;
  isLoading?: boolean;
  full?: boolean;
}
