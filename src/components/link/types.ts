export interface LinkProps {
  variant?: "primary" | "secondary";
  /** Seção que o link aponta está em cena. */
  active?: boolean;
  children: React.ReactNode;
  href: string;
}
