import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        slate: {
          950: "#020617",
        }
      },
      fontFamily: {
        display: ["var(--font-sans)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      animation: {
        "scan": "scan 3s linear infinite",
        "fade-in": "fade-in 0.3s ease-out both",
      },
      keyframes: {
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      boxShadow: {
        'flat': '0 0 0 1px rgba(0, 0, 0, 0.05)',
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px -5px rgba(59, 130, 246, 0.5)',
      },
      borderRadius: {
        'premium': '1rem',
      }
    },
  },
  plugins: [],
};

export default config;
