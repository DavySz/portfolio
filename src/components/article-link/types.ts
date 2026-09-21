export interface ArticleLinkProps {
  href: string;
  className?: string;
  children?: React.ReactNode;
  onNavigate?: () => void;
}
