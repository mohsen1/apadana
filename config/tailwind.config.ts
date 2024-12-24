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
        /* UI Colors */
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

        /* System Colors */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },

        /* Border Colors */
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        /* Additional Status Colors */
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },

        /* Additional Base Colors */
        slate: {
          DEFAULT: 'var(--slate)',
          foreground: 'var(--slate-foreground)',
        },
        stone: {
          DEFAULT: 'var(--stone)',
          foreground: 'var(--stone-foreground)',
        },
        zinc: {
          DEFAULT: 'var(--zinc)',
          foreground: 'var(--zinc-foreground)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
