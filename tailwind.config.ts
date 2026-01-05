import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          100: "#ebf0fe",
          200: "#dae3fd",
          300: "#bccdfb",
          400: "#91abf8",
          500: "#6381f1",
          600: "#4f64e9",
          700: "#414fd6",
          800: "#3942ad",
          900: "#323b8a",
          950: "#1e2251",
        },
        slate: {
          950: "#020617",
        }
      },
      fontFamily: {
        display: ["var(--font-sans)", "sans-serif"], // High-end sans for headings
        sans: ["var(--font-sans)", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'tighter': '-0.02em',
      }
    },
  },
  plugins: [],
};

export default config;
