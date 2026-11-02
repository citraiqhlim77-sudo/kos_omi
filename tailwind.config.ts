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
          DEFAULT: 'hsl(186, 72%, 24%)',
          foreground: 'hsl(0, 0%, 100%)',
          hover: 'hsl(186, 74%, 18%)',
        },
        secondary: {
          DEFAULT: 'hsl(180, 33%, 95%)',
          foreground: 'hsl(240, 6%, 10%)',
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
        heading: ['var(--font-geist)', 'Geist', 'system-ui', 'sans-serif'],
        sans: ['var(--font-geist)', 'Geist', 'system-ui', 'sans-serif'],
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

