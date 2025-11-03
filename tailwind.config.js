/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      fontSize: {
        
        "display-2xl": [
          "4.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-xl": [
          "3.75rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-md": [
          "2.25rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
        "display-sm": [
          "1.875rem",
          { lineHeight: "1.3", letterSpacing: "-0.01em" },
        ],

        
        "heading-xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "0" }],
        "heading-lg": ["1.25rem", { lineHeight: "1.4", letterSpacing: "0" }],
        "heading-md": ["1.125rem", { lineHeight: "1.4", letterSpacing: "0" }],
        "heading-sm": ["1rem", { lineHeight: "1.5", letterSpacing: "0" }],

        
        "body-xl": ["1.25rem", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-md": ["1rem", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-xs": ["0.75rem", { lineHeight: "1.5", letterSpacing: "0" }],
      },
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.01em",
        wider: "0.02em",
        widest: "0.1em",
      },
      colors: {
        primary: {
          50: "#F3F0FF",
          100: "#E9E3FF",
          200: "#D4C7FF",
          300: "#B197E8",
          400: "#9573D7",
          500: "#7947DF",
          600: "#6B3ACC",
          700: "#5A2DB8",
          800: "#4A2496",
          900: "#311961",
        },
        secondary: {
          50: "#F6F3FC",
          100: "#EDE7F6",
          200: "#D1C4E9",
          300: "#B39DDB",
          400: "#9575CD",
          500: "#7544D7",
          600: "#673AB7",
          700: "#512DA6",
          800: "#4527A0",
          900: "#2A1454",
        },
        semantic: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
        },
      },
      boxShadow: {
        primary:
          "0 10px 15px -3px rgba(121, 71, 223, 0.2), 0 4px 6px -2px rgba(121, 71, 223, 0.1)",
        "primary-hover":
          "0 20px 25px -5px rgba(121, 71, 223, 0.3), 0 10px 10px -5px rgba(121, 71, 223, 0.2)",
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "card-hover":
          "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
