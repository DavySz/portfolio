// Typography System - Design Tokens

// Typography Component Classes
export const typographyClasses = {
  // Hero Section
  heroTitle: "font-bold text-4xl md:text-6xl leading-tight tracking-tight",
  heroSubtitle: "font-regular text-lg md:text-xl leading-relaxed",

  // Section Headers
  sectionTitle: "font-bold text-3xl md:text-4xl leading-tight tracking-tight",
  sectionDescription: "font-regular text-base lg:text-xl leading-relaxed",

  // Content
  cardTitle: "font-semibold text-lg md:text-xl leading-snug",
  cardDescription: "font-regular text-sm md:text-base leading-relaxed",
  bodyText: "font-regular text-base leading-relaxed",
} as const;

export type TypographyClass = keyof typeof typographyClasses;
