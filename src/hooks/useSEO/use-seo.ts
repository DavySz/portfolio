import { useEffect, useMemo, useRef } from "react";
import type { MetaTag, SEOProps } from "./use-seo.types";

const defaultSEO: Required<SEOProps> = {
  title: "Davy de Souza Assunção | Frontend Engineer & Fintech Specialist",
  description:
    "Frontend Engineer especializado em Fintech. Construo interfaces financeiras de alta performance com React, TypeScript e Next.js. Experiência real na Fretepago.",
  keywords:
    "frontend engineer, fintech developer, react specialist, typescript expert, nextjs, frontend architecture, fretepago, design systems, mobile-first, financial applications, davy souza, davy assunção",
  image: "/images/user.jpeg",
  url: "https://davysz.com",
  type: "website",
  locale: "pt_BR",
  siteName: "Davy de Souza Assunção - Frontend Engineer",
  author: "Davy de Souza Assunção",
  canonicalUrl: "https://davysz.com",
};

export const useSEO = (props: SEOProps = {}) => {
  const seo = useMemo(() => ({ ...defaultSEO, ...props }), [props]);
  const previousSeoRef = useRef<Required<SEOProps>>(defaultSEO);

  useEffect(() => {
    const previousSeo = previousSeoRef.current;

    // Only update title if it changed
    if (seo.title !== previousSeo.title) {
      document.title = seo.title;
    }

    // Create or update meta tags only if SEO data changed
    if (JSON.stringify(seo) !== JSON.stringify(previousSeo)) {
      const existingMetas = document.querySelectorAll(
        'meta[data-dynamic="true"]',
      );
      existingMetas.forEach((meta) => meta.remove());

      const metaTags: MetaTag[] = [
        { name: "description", content: seo.description },
        { name: "keywords", content: seo.keywords },
        { name: "author", content: seo.author },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.description },
        { property: "og:image", content: seo.image },
        { property: "og:url", content: seo.url },
        { property: "og:type", content: seo.type },
        { property: "og:locale", content: seo.locale },
        { property: "og:site_name", content: seo.siteName },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seo.title },
        { name: "twitter:description", content: seo.description },
        { name: "twitter:image", content: seo.image },
      ];

      const fragment = document.createDocumentFragment();
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

        fragment.appendChild(meta);
      });

      document.head.appendChild(fragment);

      // Update canonical link
      let canonicalLink = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement;

      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }

      if (canonicalLink.getAttribute("href") !== seo.canonicalUrl) {
        canonicalLink.setAttribute("href", seo.canonicalUrl);
      }

      // Store current SEO values
      previousSeoRef.current = seo;
    }
  }, [seo]);

  return seo;
};
