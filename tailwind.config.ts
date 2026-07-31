import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6A1A",
        secondary: "#1D1D20",
        tertiary: "#26262A",
        neutral: "#141416",
        surface: {
          0: "#141416",
          1: "#1D1D20",
          2: "#26262A",
          3: "#303036",
        },
        text: {
          primary: "#F2F2F2",
          secondary: "#9B9BA0",
          muted: "#5C5C63",
        },
        tier: {
          0: "#9B9BA0",
          1: "#FF6A1A",
          agentic: "#A855F7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
} satisfies Config;
