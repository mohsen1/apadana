import type { Config } from 'tailwindcss';

const content = [
  'src/**/*.{js,ts,jsx,tsx,mdx}',
  'app/**/*.{js,ts,jsx,tsx,mdx}',
  '.storybook/**/*.{js,ts,jsx,tsx,mdx}',
].map((path) => `${process.cwd()}/${path}`);

const config: Config = {
  content,
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // UI colors
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },

        // Border and ring
        border: 'var(--border)',
        ring: 'var(--ring)',

        // Input
        input: 'var(--input)',

        // Card
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },

        // Popover
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
