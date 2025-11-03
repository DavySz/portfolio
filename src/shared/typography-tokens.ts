// Typography System - Design Tokens

export const typography = {
  // Font Families
  fontFamily: {
    primary: ["Poppins", "sans-serif"],
    heading: ["Poppins", "sans-serif"],
    body: ["Poppins", "sans-serif"],
  },

  // Font Weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Typography Scale
  fontSize: {
    // Display (Headlines principais)
    "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }], // 72px
    "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }], // 60px
    "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }], // 48px
    "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }], // 36px
    "display-sm": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }], // 30px

    // Headings (Títulos de seção)
    "heading-xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "0" }], // 24px
    "heading-lg": ["1.25rem", { lineHeight: "1.4", letterSpacing: "0" }], // 20px
    "heading-md": ["1.125rem", { lineHeight: "1.4", letterSpacing: "0" }], // 18px
    "heading-sm": ["1rem", { lineHeight: "1.5", letterSpacing: "0" }], // 16px

    // Body Text
    "body-xl": ["1.25rem", { lineHeight: "1.6", letterSpacing: "0" }], // 20px
    "body-lg": ["1.125rem", { lineHeight: "1.6", letterSpacing: "0" }], // 18px
    "body-md": ["1rem", { lineHeight: "1.6", letterSpacing: "0" }], // 16px
    "body-sm": ["0.875rem", { lineHeight: "1.6", letterSpacing: "0" }], // 14px
    "body-xs": ["0.75rem", { lineHeight: "1.5", letterSpacing: "0" }], // 12px

    // Labels & Captions
    "label-lg": ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.01em" }], // 14px
    "label-md": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.01em" }], // 12px
    "label-sm": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.02em" }], // 11px
  },

  // Responsive Typography Breakpoints
  responsive: {
    // Mobile-first approach
    mobile: {
      "hero-title": [
        "2.25rem",
        { lineHeight: "1.2", letterSpacing: "-0.01em" },
      ], // 36px
      "hero-subtitle": ["1.125rem", { lineHeight: "1.6", letterSpacing: "0" }], // 18px
      "section-title": [
        "1.875rem",
        { lineHeight: "1.3", letterSpacing: "-0.01em" },
      ], // 30px
      "section-description": [
        "1rem",
        { lineHeight: "1.6", letterSpacing: "0" },
      ], // 16px
    },
    desktop: {
      "hero-title": [
        "3.75rem",
        { lineHeight: "1.1", letterSpacing: "-0.02em" },
      ], // 60px
      "hero-subtitle": ["1.25rem", { lineHeight: "1.6", letterSpacing: "0" }], // 20px
      "section-title": [
        "2.25rem",
        { lineHeight: "1.2", letterSpacing: "-0.01em" },
      ], // 36px
      "section-description": [
        "1.125rem",
        { lineHeight: "1.6", letterSpacing: "0" },
      ], // 18px
    },
  },

  // Text Colors (semantic)
  colors: {
    primary: "text-gray-900",
    secondary: "text-gray-700",
    muted: "text-gray-600",
    subtle: "text-gray-500",
    accent: "text-primary-600",
    gradient:
      "bg-gradient-to-tr from-primary-500 to-primary-900 bg-clip-text text-transparent",
  },

  // Text Utilities
  utilities: {
    truncate: "truncate",
    ellipsis: "text-ellipsis",
    noWrap: "whitespace-nowrap",
    balance: "text-balance", // CSS text-wrap: balance
    pretty: "text-pretty", // CSS text-wrap: pretty
  },
} as const;

// Typography Component Classes
export const typographyClasses = {
  // Hero Section
  heroTitle: "font-bold text-4xl md:text-6xl leading-tight tracking-tight",
  heroSubtitle: "font-regular text-lg md:text-xl leading-relaxed",

  // Section Headers
  sectionTitle: "font-bold text-3xl md:text-4xl leading-tight tracking-tight",
  sectionSubtitle: "font-medium text-xl md:text-2xl leading-snug",
  sectionDescription: "font-regular text-base lg:text-xl leading-relaxed",

  // Content
  cardTitle: "font-semibold text-lg md:text-xl leading-snug",
  cardDescription: "font-regular text-sm md:text-base leading-relaxed",
  bodyText: "font-regular text-base leading-relaxed",
  caption: "font-medium text-sm leading-normal tracking-wide",

  // Navigation
  navLink: "font-medium text-base leading-normal",
  navLabel: "font-semibold text-sm uppercase tracking-wider",

  // Buttons
  buttonText: "font-semibold text-base leading-none",
  buttonSmall: "font-semibold text-sm leading-none",
  buttonLarge: "font-semibold text-lg leading-none",
} as const;

export type TypographyClass = keyof typeof typographyClasses;
