export interface LinkProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: VoidFunction;
  href: string;
}
