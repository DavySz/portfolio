export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  siteName?: string;
  author?: string;
  canonicalUrl?: string;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}
