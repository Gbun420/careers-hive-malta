import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: '#1565C0', // Mediterranean Blue
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#FFB300', // Sun Gold
  				foreground: '#1A1A1A'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: '#E3F2FD', // Soft Sky Blue
  				foreground: '#1565C0'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
        brand: {
          navy: '#0D47A1',
          gold: '#FFA000',
          sand: '#F5F5F5',
          teal: '#00897B'
        }
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
        '3xl': '1.5rem',
        '4xl': '2rem',
  		},
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(21, 101, 192, 0.1)',
        'gold-glow': '0 0 20px rgba(255, 179, 0, 0.2)',
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'widest-plus': '0.2em',
      }
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;