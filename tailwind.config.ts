import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF4FF",
          100: "#DBE6FE",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        secondary: {
          DEFAULT: "#14B8A6",
          50: "#EFFDFA",
          100: "#CCFBF1",
          500: "#14B8A6",
          600: "#0D9488",
        },
        accent: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          500: "#F59E0B",
          600: "#D97706",
        },
        success: "#22C55E",
        surface: {
          DEFAULT: "#F8FAFC",
          dark: "#0B1220",
        },
        card: {
          DEFAULT: "#FFFFFF",
          dark: "#111A2E",
        },
        ink: {
          DEFAULT: "#0F172A",
          dark: "#F1F5F9",
        },
        muted: {
          DEFAULT: "#64748B",
          dark: "#94A3B8",
        },
        line: {
          DEFAULT: "#E2E8F0",
          dark: "#1E293B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "hero-sm": ["34px", { lineHeight: "1.15", fontWeight: "700" }],
        section: ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        "section-sm": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
      },
      borderRadius: {
        xl2: "16px",
        xl3: "20px",
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgb(15 23 42 / 0.04), 0 1px 2px 0 rgb(15 23 42 / 0.03)",
        lift: "0 20px 40px -12px rgb(37 99 235 / 0.18)",
        glow: "0 0 0 1px rgb(37 99 235 / 0.08), 0 8px 24px -4px rgb(37 99 235 / 0.15)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgb(226 232 240 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.6) 1px, transparent 1px)",
      },
      keyframes: {
        squeeze: {
          "0%, 100%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(0.86)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.45" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        squeeze: "squeeze 2.4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        ripple: "ripple 600ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
