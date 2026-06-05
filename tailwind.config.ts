import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand — a refined indigo-violet
        primary: {
          50:  "#f3f2ff",
          100: "#e9e8ff",
          200: "#d5d2ff",
          300: "#b6b1ff",
          400: "#9188fc",
          500: "#6d62f5",
          600: "#5a4fe8",
          700: "#4c40d0",
          800: "#3f36aa",
          900: "#352e87",
        },
        // Neutral — warm-tinted grays (not cold zinc)
        neutral: {
          0:   "#ffffff",
          50:  "#fafaf9",
          100: "#f5f4f2",
          200: "#eeecea",
          300: "#dedad6",
          400: "#b8b4ae",
          500: "#8c8880",
          600: "#605c56",
          700: "#454240",
          800: "#2e2c2a",
          900: "#1a1917",
        },
        // Semantic
        success: { light: "#f0fdf4", border: "#bbf7d0", text: "#166534", DEFAULT: "#16a34a" },
        warning: { light: "#fffbeb", border: "#fde68a", text: "#92400e", DEFAULT: "#d97706" },
        danger:  { light: "#fef2f2", border: "#fecaca", text: "#991b1b", DEFAULT: "#dc2626" },
        info:    { light: "#eff6ff", border: "#bfdbfe", text: "#1e40af", DEFAULT: "#2563eb" },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
        xs:   ["11px", "16px"],
        sm:   ["13px", "20px"],
        base: ["14px", "22px"],
        md:   ["15px", "24px"],
        lg:   ["17px", "26px"],
        xl:   ["20px", "28px"],
        "2xl":["24px", "32px"],
        "3xl":["30px", "38px"],
      },
      borderRadius: {
        sm:   "6px",
        DEFAULT: "8px",
        md:   "10px",
        lg:   "14px",
        xl:   "18px",
        "2xl":"24px",
      },
      boxShadow: {
        xs:  "0 1px 2px rgba(0,0,0,0.04)",
        sm:  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        md:  "0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
        lg:  "0 8px 20px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.04)",
        xl:  "0 16px 40px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)",
        "inner-sm": "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "fade-in":   { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up":  { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in-right": { from: { opacity: "0", transform: "translateX(8px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        shimmer:     { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        "pulse-dot": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        "spin-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-in":   "fade-in 0.18s ease-out",
        "slide-up":  "slide-up 0.22s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        shimmer:     "shimmer 1.6s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "spin-slow": "spin-slow 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;