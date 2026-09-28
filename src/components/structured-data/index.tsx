import { useEffect } from "react";
import { CONTACTS } from "../../shared/constants";
import type { StructuredDataProps } from "./types";
import { SITE_ORIGIN } from "../../shared/site";

export const StructuredData: React.FC<StructuredDataProps> = ({
  locale = "pt-BR",
}) => {
  useEffect(() => {
    const existingScripts = document.querySelectorAll(
      'script[type="application/ld+json"][data-structured="true"]'
    );
    existingScripts.forEach((script) => script.remove());

    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/#person`,
      name: "Davy de Souza Assunção",
      givenName: "Davy",
      familyName: "de Souza Assunção",
      alternateName: "DavySz",
      description:
        locale === "pt-BR"
          ? "Senior Frontend Engineer focado em arquitetura frontend, plataformas, Micro Frontends, BFFs e observabilidade"
          : "Senior Frontend Engineer focused on frontend architecture, platforms, Micro Frontends, BFFs and observability",
      url: SITE_ORIGIN,
      image: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/images/user.jpeg`,
        width: 400,
        height: 400,
      },
      sameAs: [
        CONTACTS.LINKEDIN,
        CONTACTS.GITHUB,
        CONTACTS.MEDIUM,
        CONTACTS.INSTAGRAM,
      ],
      jobTitle:
        locale === "pt-BR"
          ? "Senior Frontend Engineer"
          : "Senior Frontend Engineer",
      worksFor: {
        "@type": "Organization",
        name: "Fretebras",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Manaus",
        addressRegion: "AM",
        addressCountry: "BR",
      },
      email: CONTACTS.GMAIL,
      telephone: CONTACTS.PHONE,
      knowsAbout: [
        "React",
        "TypeScript",
        "JavaScript",
        "Micro Frontends",
        "Module Federation",
        "Frontend Architecture",
        "Design Systems",
        "Backend For Frontend",
        "Node.js",
        "NestJS",
        "Observability",
        "React Native",
        "Frontend Development",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name:
          locale === "pt-BR"
            ? "Engenheiro de Software Frontend"
            : "Frontend Software Engineer",
        occupationLocation: {
          "@type": "Country",
          name: "Brazil",
        },
        skills: [
          "React",
          "TypeScript",
          "Micro Frontends",
          "Module Federation",
          "Frontend Architecture",
          "Design Systems",
          "Backend For Frontend",
          "Node.js",
          "NestJS",
          "Observability",
        ],
      },
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      name:
        locale === "pt-BR"
          ? "Davy de Souza Assunção - Portfolio"
          : "Davy de Souza Assunção - Portfolio",
      description:
        locale === "pt-BR"
          ? "Portfólio pessoal de Davy de Souza Assunção, Senior Frontend Engineer focado em arquitetura frontend, plataformas, Micro Frontends e BFFs"
          : "Personal portfolio of Davy de Souza Assunção, Senior Frontend Engineer focused on frontend architecture, platforms, Micro Frontends and BFFs",
      url: SITE_ORIGIN,
      author: {
        "@type": "Person",
        "@id": `${SITE_ORIGIN}/#person`,
      },
      publisher: {
        "@type": "Person",
        "@id": `${SITE_ORIGIN}/#person`,
      },
      inLanguage: locale === "pt-BR" ? "pt-BR" : "en-US",
      copyrightYear: new Date().getFullYear(),
      copyrightHolder: {
        "@type": "Person",
        "@id": `${SITE_ORIGIN}/#person`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_ORIGIN}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    const professionalServiceSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_ORIGIN}/#service`,
      name:
        locale === "pt-BR"
          ? "Engenharia e Arquitetura Frontend"
          : "Frontend Engineering and Architecture",
      description:
        locale === "pt-BR"
          ? "Arquitetura de sistemas frontend, plataformas compartilhadas, Micro Frontends, BFFs e observabilidade"
          : "Frontend system architecture, shared platforms, Micro Frontends, BFFs and observability",
      provider: {
        "@type": "Person",
        "@id": `${SITE_ORIGIN}/#person`,
      },
      areaServed: {
        "@type": "Country",
        name: "Brazil",
      },
      serviceType: [
        "Frontend Architecture",
        "Frontend Platform Engineering",
        "Micro Frontends",
        "Module Federation",
        "Backend For Frontend",
        "Design Systems",
        "Frontend Observability",
        "React Development",
        "TypeScript Development",
        "Node.js Development",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name:
          locale === "pt-BR"
            ? "Frentes de atuação"
            : "Areas of work",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name:
                locale === "pt-BR"
                  ? "Arquitetura Frontend"
                  : "Frontend Architecture",
              description:
                locale === "pt-BR"
                  ? "Arquitetura e evolução de ecossistemas frontend com React, TypeScript, Micro Frontends e Module Federation"
                  : "Architecture and evolution of frontend ecosystems with React, TypeScript, Micro Frontends and Module Federation",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name:
                locale === "pt-BR"
                  ? "Plataformas Frontend"
                  : "Frontend Platforms",
              description:
                locale === "pt-BR"
                  ? "SDKs compartilhados, Design Systems, BFFs em Node.js e NestJS e observabilidade de eventos e erros"
                  : "Shared SDKs, Design Systems, BFFs in Node.js and NestJS, and event and error observability",
            },
          },
        ],
      },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "pt-BR" ? "Início" : "Home",
          item: SITE_ORIGIN,
        },
      ],
    };

    const schemas = [
      personSchema,
      websiteSchema,
      professionalServiceSchema,
      breadcrumbSchema,
    ];

    schemas.forEach((schema, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-structured", "true");
      script.setAttribute("data-schema", `schema-${index}`);
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });
  }, [locale]);

  return null;
};
