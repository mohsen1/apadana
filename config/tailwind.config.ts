import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

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
          hover: 'color-mix(in srgb, var(--primary) 85%, black)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
          hover: 'color-mix(in srgb, var(--secondary) 85%, black)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
          hover: 'color-mix(in srgb, var(--muted) 85%, black)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          hover: 'color-mix(in srgb, var(--accent) 85%, black)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
          hover: 'color-mix(in srgb, var(--destructive) 85%, black)',
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
          hover: 'color-mix(in srgb, var(--success) 85%, black)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
          hover: 'color-mix(in srgb, var(--warning) 85%, black)',
        },

        /* Additional Base Colors */
        slate: {
          DEFAULT: 'var(--slate)',
          foreground: 'var(--slate-foreground)',
          hover: 'color-mix(in srgb, var(--slate) 85%, black)',
        },
        stone: {
          DEFAULT: 'var(--stone)',
          foreground: 'var(--stone-foreground)',
          hover: 'color-mix(in srgb, var(--stone) 85%, black)',
        },
        zinc: {
          DEFAULT: 'var(--zinc)',
          foreground: 'var(--zinc-foreground)',
          hover: 'color-mix(in srgb, var(--zinc) 85%, black)',
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('state-active', '&[data-state="active"]');
      addVariant('state-open', '&[data-state="open"]');
      addVariant('state-closed', '&[data-state="closed"]');
      addVariant('state-on', '&[data-state="on"]');
      addVariant('state-off', '&[data-state="off"]');
      addVariant('state-checked', '&[data-state="checked"]');
      addVariant('state-unchecked', '&[data-state="unchecked"]');
    }),
  ],
};

export default config;
