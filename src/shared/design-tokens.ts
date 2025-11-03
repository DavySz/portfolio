/**
 * Design Tokens - Sistema de Design Unificado
 * Base para toda padronização visual do portfólio
 */

export const designTokens = {
  // 🎨 CORES
  colors: {
    primary: {
      50: "#F3F0FF",
      100: "#E9E3FF",
      200: "#D4C7FF",
      300: "#B197E8",
      400: "#9573D7",
      500: "#7947DF", // Cor principal atual
      600: "#6B3ACC",
      700: "#5A2DB8",
      800: "#4A2496",
      900: "#311961", // Cor escura atual
    },

    secondary: {
      50: "#F6F3FC", // Background atual claro
      100: "#EDE7F6",
      200: "#D1C4E9",
      300: "#B39DDB",
      400: "#9575CD",
      500: "#7544D7", // Border atual
      600: "#673AB7",
      700: "#512DA6",
      800: "#4527A0",
      900: "#2A1454", // Background escuro atual
    },

    gray: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#5F5F5F", // Texto secundário atual
      800: "#424242",
      900: "#212121",
    },

    semantic: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },

    // Estados de interação
    interaction: {
      hover: "rgba(121, 71, 223, 0.1)",
      focus: "rgba(121, 71, 223, 0.2)",
      active: "rgba(121, 71, 223, 0.3)",
      disabled: "rgba(95, 95, 95, 0.3)",
    },
  },

  // 📏 ESPAÇAMENTOS
  spacing: {
    // Seções principais
    section: {
      sm: "py-12 md:py-16",
      md: "py-16 md:py-24",
      lg: "py-20 md:py-32",
    },

    // Container horizontal
    container: {
      sm: "px-4 md:px-6",
      md: "px-6 xl:px-[100px]",
      lg: "px-8 xl:px-[120px]",
    },

    // Gaps entre elementos
    gap: {
      xs: "gap-2",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
      "2xl": "gap-16",
      "3xl": "gap-24",
    },

    // Margins específicos
    margin: {
      section: "mb-16 md:mb-24",
      card: "mb-8 md:mb-12",
      text: "mb-4 md:mb-6",
    },
  },

  // 📝 TIPOGRAFIA
  typography: {
    // Títulos principais (h1)
    heading: {
      xl: "text-4xl md:text-5xl xl:text-6xl font-bold font-poppins",
      lg: "text-3xl md:text-4xl xl:text-5xl font-bold font-poppins",
      md: "text-2xl md:text-3xl xl:text-4xl font-bold font-poppins",
      sm: "text-xl md:text-2xl xl:text-3xl font-bold font-poppins",
    },

    // Subtítulos (h2, h3)
    subheading: {
      lg: "text-xl md:text-2xl font-semibold font-poppins",
      md: "text-lg md:text-xl font-semibold font-poppins",
      sm: "text-base md:text-lg font-semibold font-poppins",
    },

    // Texto do corpo
    body: {
      lg: "text-lg md:text-xl font-normal font-poppins",
      md: "text-base md:text-lg font-normal font-poppins",
      sm: "text-sm md:text-base font-normal font-poppins",
    },

    // Texto de apoio
    caption: {
      lg: "text-base font-medium font-poppins",
      md: "text-sm font-medium font-poppins",
      sm: "text-xs font-medium font-poppins",
    },
  },

  // 🎭 SOMBRAS
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",

    // Sombras coloridas
    primary: "shadow-lg shadow-primary-500/20",
    primaryHover: "shadow-xl shadow-primary-500/30",

    // Sombras para cards
    card: "shadow-lg shadow-gray-900/10",
    cardHover: "shadow-xl shadow-gray-900/15",
  },

  // 🔄 TRANSIÇÕES
  transitions: {
    fast: "transition-all duration-150 ease-out",
    normal: "transition-all duration-300 ease-out",
    slow: "transition-all duration-500 ease-out",

    // Transições específicas
    hover: "transition-all duration-300 ease-out",
    focus: "transition-all duration-200 ease-out",
    color: "transition-colors duration-300 ease-out",
    transform: "transition-transform duration-300 ease-out",
  },

  // 📐 BORDAS E RAIOS
  border: {
    radius: {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-2xl",
      xl: "rounded-3xl",
      full: "rounded-full",
    },

    width: {
      thin: "border",
      medium: "border-2",
      thick: "border-4",
    },
  },

  // 🎯 EFEITOS DE HOVER
  effects: {
    hover: {
      scale: "hover:scale-105",
      scaleSmall: "hover:scale-102",
      lift: "hover:-translate-y-2",
      liftSmall: "hover:-translate-y-1",
      glow: "hover:shadow-lg hover:shadow-primary-500/25",
    },

    active: {
      scale: "active:scale-95",
      scaleSmall: "active:scale-98",
    },
  },
} as const;

// 🎨 GRADIENTES PRÉ-DEFINIDOS
export const gradients = {
  primary: "bg-gradient-to-r from-primary-500 to-primary-900",
  primaryText:
    "bg-gradient-to-tr from-primary-500 to-primary-900 bg-clip-text text-transparent",
  primaryHover: "hover:from-primary-400 hover:to-primary-800",

  secondary: "bg-gradient-to-r from-secondary-500 to-secondary-900",
  secondaryText:
    "bg-gradient-to-tr from-secondary-500 to-secondary-900 bg-clip-text text-transparent",
} as const;

// 🏗️ HELPERS PARA COMPONENTES
export const componentStyles = {
  // Container padrão das seções
  section: `${designTokens.spacing.section.md} ${designTokens.spacing.container.md}`,

  // Card padrão
  card: `${designTokens.border.radius.lg} ${designTokens.shadows.card} ${designTokens.transitions.hover}`,

  // Botão base
  button: `${designTokens.border.radius.xl} ${designTokens.transitions.hover} ${designTokens.effects.hover.scale} ${designTokens.effects.active.scale}`,

  // Link base
  link: `${designTokens.transitions.color}`,
} as const;
