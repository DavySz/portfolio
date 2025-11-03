import { useEffect, useMemo } from "react";
import { MetaTag, SEOProps } from "./use-seo.types";

const defaultSEO: Required<SEOProps> = {
  title: "Davy de Souza Assunção | Full Stack Developer",
  description:
    "Desenvolvedor Full Stack especializado em React, React Native, TypeScript e Node.js. Transformo ideias em soluções digitais inovadoras.",
  keywords:
    "desenvolvedor, full stack, react, react native, typescript, nodejs, javascript, frontend, backend, mobile, web",
  image: "/images/user.jpeg",
  url: "https://davysz.com",
  type: "website",
  locale: "pt_BR",
  siteName: "Davy de Souza Assunção - Portfolio",
  author: "Davy de Souza Assunção",
  canonicalUrl: "https://davysz.com",
};

export const useSEO = (props: SEOProps = {}) => {
  const seo = useMemo(() => ({ ...defaultSEO, ...props }), [props]);

  useEffect(() => {
    document.title = seo.title;

    const existingMetas = document.querySelectorAll(
      'meta[data-dynamic="true"]'
    );
    existingMetas.forEach((meta) => meta.remove());

    const metaTags: MetaTag[] = [
      { name: "description", content: seo.description },
      { name: "keywords", content: seo.keywords },
      { name: "author", content: seo.author },
      { name: "robots", content: "index, follow" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#7947DF" },

      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:image", content: seo.image },
      { property: "og:url", content: seo.url },
      { property: "og:type", content: seo.type },
      { property: "og:locale", content: seo.locale },
      { property: "og:site_name", content: seo.siteName },

      { name: "format-detection", content: "telephone=no" },
      { name: "msapplication-TileColor", content: "#7947DF" },
      { name: "msapplication-config", content: "/browserconfig.xml" },
    ];

    metaTags.forEach((tag) => {
      const meta = document.createElement("meta");
      meta.setAttribute("data-dynamic", "true");

      if (tag.name) {
        meta.setAttribute("name", tag.name);
      }
      if (tag.property) {
        meta.setAttribute("property", tag.property);
      }
      meta.setAttribute("content", tag.content);

      document.head.appendChild(meta);
    });

    let canonicalLink = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;

    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute("href", seo.canonicalUrl);

    const alternateLinks = [
      { hreflang: "pt-BR", href: `${seo.url}` },
      { hreflang: "en", href: `${seo.url}/en` },
      { hreflang: "x-default", href: `${seo.url}` },
    ];

    const existingAlternates = document.querySelectorAll(
      'link[rel="alternate"][data-dynamic="true"]'
    );
    existingAlternates.forEach((link) => link.remove());

    alternateLinks.forEach((alt) => {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", alt.hreflang);
      link.setAttribute("href", alt.href);
      link.setAttribute("data-dynamic", "true");
      document.head.appendChild(link);
    });
  }, [seo]);

  return seo;
};
