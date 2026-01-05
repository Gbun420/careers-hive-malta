import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design Tokens
        navy: {
          50: '#f2f5f9',
          100: '#e1e8f2',
          200: '#c7d5e7',
          300: '#a1b9d7',
          400: '#7395c1',
          500: '#5277a8',
          600: '#3f5d8a',
          700: '#334b6f',
          800: '#2d405d',
          900: '#29374d',
          950: '#1b2331', // Primary Navy
        },
        coral: {
          50: '#fff3f2',
          100: '#ffe4e1',
          200: '#ffccc7',
          300: '#ffa69e',
          400: '#ff7366',
          500: '#ff5444', // Secondary Coral
          600: '#ed3422',
          700: '#c82819',
          800: '#a52418',
          900: '#892319',
          950: '#4b0e08',
        },
        gold: {
          50: '#fdfce9',
          100: '#fbf7c5',
          200: '#f7ed8e',
          300: '#f1db4f',
          400: '#e9c421',
          500: '#d5aa16', // Premium Gold
          600: '#b88510',
          700: '#926010',
          800: '#784d14',
          900: '#674116',
          950: '#3c2209',
        },
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
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Geist", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        'premium': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'gold-glow': '0 0 20px -5px rgba(213, 170, 22, 0.3)',
      }
    },
  },
  plugins: [],
};

export default config;