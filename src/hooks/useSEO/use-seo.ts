import { useEffect, useMemo, useRef } from "react";
import type { MetaTag, SEOProps } from "./use-seo.types";

/**
 * Só o que não depende de idioma. O texto vem dos locales, passado por quem
 * chama — antes estes padrões eram português fixo, inclusive `locale: pt_BR`,
 * num site que abre em inglês.
 *
 * As tags são atualizadas **no lugar**, procurando por `name`/`property` e
 * criando só o que não existe. Antes elas eram acrescentadas com um marcador
 * `data-dynamic`, e só esse marcador era removido: as tags estáticas do
 * `index.html` continuavam ali, então o documento acabava com duas
 * `description` e dois `og:locale`. Crawler e scraper de rede social que não
 * executam JS leem a primeira — em português, num site que abre em inglês.
 */
const defaultSEO: Required<SEOProps> = {
  title: "Davy de Souza Assunção",
  description: "",
  keywords: "",
  image: "/images/user.jpeg",
  url: "https://davysz.com",
  type: "website",
  locale: "en_US",
  siteName: "Davy de Souza Assunção",
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
        // O idioma em que a página também existe. Sem isto, trocar o idioma
        // deixava o `og:locale:alternate` do HTML contradizendo o `og:locale`.
        {
          property: "og:locale:alternate",
          content: seo.locale === "pt_BR" ? "en_US" : "pt_BR",
        },
        { property: "og:site_name", content: seo.siteName },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seo.title },
        { name: "twitter:description", content: seo.description },
        { name: "twitter:image", content: seo.image },
      ];

      for (const tag of metaTags) {
        const attribute = tag.name ? "name" : "property";
        const value = tag.name ?? tag.property;
        if (!value) continue;

        let meta = document.head.querySelector<HTMLMetaElement>(
          `meta[${attribute}="${value}"]`,
        );

        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute(attribute, value);
          document.head.appendChild(meta);
        }

        if (meta.getAttribute("content") !== tag.content) {
          meta.setAttribute("content", tag.content);
        }
      }

      // Store current SEO values
      previousSeoRef.current = seo;
    }
  }, [seo]);

  return seo;
};
