import { useEffect } from "react";
import { CONTACTS } from "../../shared/constants";
import type { StructuredDataProps } from "./types";

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
      "@id": "https://davysz.com/#person",
      name: "Davy de Souza Assunção",
      givenName: "Davy",
      familyName: "de Souza Assunção",
      alternateName: "DavySz",
      description:
        locale === "pt-BR"
          ? "Desenvolvedor Full Stack especializado em React, React Native, TypeScript e Node.js"
          : "Full Stack Developer specializing in React, React Native, TypeScript and Node.js",
      url: "https://davysz.com",
      image: {
        "@type": "ImageObject",
        url: "https://davysz.com/images/user.jpeg",
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
          ? "Desenvolvedor Full Stack"
          : "Full Stack Developer",
      worksFor: {
        "@type": "Organization",
        name: "Freelancer",
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
        "React Native",
        "TypeScript",
        "JavaScript",
        "Node.js",
        "Next.js",
        "Tailwind CSS",
        "Mobile Development",
        "Web Development",
        "Frontend Development",
        "Backend Development",
        "Full Stack Development",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name:
          locale === "pt-BR"
            ? "Desenvolvedor de Software"
            : "Software Developer",
        occupationLocation: {
          "@type": "Country",
          name: "Brazil",
        },
        skills: [
          "React",
          "React Native",
          "TypeScript",
          "JavaScript",
          "Node.js",
          "Frontend Development",
          "Backend Development",
          "Mobile Development",
          "Web Development",
        ],
      },
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://davysz.com/#website",
      name:
        locale === "pt-BR"
          ? "Davy de Souza Assunção - Portfolio"
          : "Davy de Souza Assunção - Portfolio",
      description:
        locale === "pt-BR"
          ? "Portfolio pessoal de Davy de Souza Assunção, desenvolvedor Full Stack especializado em React, React Native, TypeScript e Node.js"
          : "Personal portfolio of Davy de Souza Assunção, Full Stack developer specializing in React, React Native, TypeScript and Node.js",
      url: "https://davysz.com",
      author: {
        "@type": "Person",
        "@id": "https://davysz.com/#person",
      },
      publisher: {
        "@type": "Person",
        "@id": "https://davysz.com/#person",
      },
      inLanguage: locale === "pt-BR" ? "pt-BR" : "en-US",
      copyrightYear: new Date().getFullYear(),
      copyrightHolder: {
        "@type": "Person",
        "@id": "https://davysz.com/#person",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://davysz.com/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    };

    const professionalServiceSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": "https://davysz.com/#service",
      name:
        locale === "pt-BR"
          ? "Serviços de Desenvolvimento de Software"
          : "Software Development Services",
      description:
        locale === "pt-BR"
          ? "Desenvolvimento de aplicações web e mobile, frontend e backend"
          : "Web and mobile application development, frontend and backend",
      provider: {
        "@type": "Person",
        "@id": "https://davysz.com/#person",
      },
      areaServed: {
        "@type": "Country",
        name: "Brazil",
      },
      serviceType: [
        "Web Development",
        "Mobile Development",
        "Frontend Development",
        "Backend Development",
        "Full Stack Development",
        "React Development",
        "React Native Development",
        "TypeScript Development",
        "Node.js Development",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name:
          locale === "pt-BR"
            ? "Serviços de Desenvolvimento"
            : "Development Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name:
                locale === "pt-BR" ? "Desenvolvimento Web" : "Web Development",
              description:
                locale === "pt-BR"
                  ? "Desenvolvimento de aplicações web modernas usando React, TypeScript e tecnologias atuais"
                  : "Development of modern web applications using React, TypeScript and current technologies",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name:
                locale === "pt-BR"
                  ? "Desenvolvimento Mobile"
                  : "Mobile Development",
              description:
                locale === "pt-BR"
                  ? "Criação de aplicativos móveis nativos e cross-platform com React Native"
                  : "Creation of native and cross-platform mobile applications with React Native",
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
          item: "https://davysz.com",
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
