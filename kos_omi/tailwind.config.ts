import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(217, 91%, 45%)',
          foreground: 'hsl(0, 0%, 100%)',
          hover: 'hsl(217, 91%, 38%)',
        },
        secondary: {
          DEFAULT: 'hsl(214, 95%, 96%)',
          foreground: 'hsl(222, 47%, 11%)',
        },
        accent: {
          DEFAULT: 'hsl(152, 69%, 36%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 72%, 51%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
