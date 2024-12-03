import path from 'path';
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import { withUt } from 'uploadthing/tw';
const config: Config = {
  content: [
    path.join(__dirname, '../src/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, '../src/pages/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, '../src/components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, '../src/app/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, '../src/stories/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        heading: ['var(--font-heading)', ...fontFamily.serif],
        subheading: ['var(--font-subheading)', ...fontFamily.serif],
      },
      animation: {
        'fade-in-300': 'fadeIn 300ms ease-in-out',
      },
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border))',
          foreground: 'hsl(var(--border-foreground))',
        },
        input: {
          DEFAULT: 'hsl(var(--input))',
          foreground: 'hsl(var(--input-foreground))',
        },
        ring: {
          DEFAULT: 'hsl(var(--ring))',
          foreground: 'hsl(var(--ring-foreground))',
        },
        background: {
          DEFAULT: 'hsl(var(--background))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
  plugins: [],
};

export default withUt(config);
