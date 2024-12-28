import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const content = ['./src/**/*.{js,ts,jsx,tsx,mdx}', './.storybook/**/*.{js,ts,jsx,tsx,mdx}'];

const config: Config = {
  content,
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xlg: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        full: '9999px',
      },
      colors: {
        /* UI Colors */
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--primary-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--primary)) 85%, black)',
          100: 'rgb(var(--primary-100))',
          200: 'rgb(var(--primary-200))',
          300: 'rgb(var(--primary-300))',
          400: 'rgb(var(--primary-400))',
          500: 'rgb(var(--primary-500))',
          600: 'rgb(var(--primary-600))',
          700: 'rgb(var(--primary-700))',
          800: 'rgb(var(--primary-800))',
          900: 'rgb(var(--primary-900))',
          950: 'rgb(var(--primary-950))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          foreground: 'rgb(var(--secondary-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--secondary)) 85%, black)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          foreground: 'rgb(var(--muted-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--muted)) 85%, black)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent))',
          foreground: 'rgb(var(--accent-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--accent)) 85%, black)',
          100: 'rgb(var(--accent-100))',
          200: 'rgb(var(--accent-200))',
          300: 'rgb(var(--accent-300))',
          400: 'rgb(var(--accent-400))',
          500: 'rgb(var(--accent-500))',
          600: 'rgb(var(--accent-600))',
          700: 'rgb(var(--accent-700))',
          800: 'rgb(var(--accent-800))',
          900: 'rgb(var(--accent-900))',
          950: 'rgb(var(--accent-950))',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive))',
          foreground: 'rgb(var(--destructive-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--destructive)) 85%, black)',
          100: 'rgb(var(--destructive-100))',
          200: 'rgb(var(--destructive-200))',
          300: 'rgb(var(--destructive-300))',
          400: 'rgb(var(--destructive-400))',
          500: 'rgb(var(--destructive-500))',
          600: 'rgb(var(--destructive-600))',
          700: 'rgb(var(--destructive-700))',
          800: 'rgb(var(--destructive-800))',
          900: 'rgb(var(--destructive-900))',
          950: 'rgb(var(--destructive-950))',
        },

        /* System Colors */
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        card: {
          DEFAULT: 'rgb(var(--card))',
          foreground: 'rgb(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover))',
          foreground: 'rgb(var(--popover-foreground))',
        },

        /* Border Colors */
        border: {
          DEFAULT: 'rgb(var(--border))',
          hover: 'color-mix(in srgb, rgb(var(--border)) 85%, black)',
        },
        input: 'rgb(var(--input))',
        ring: {
          DEFAULT: 'rgb(var(--ring))',
          100: 'rgb(var(--ring-100))',
          200: 'rgb(var(--ring-200))',
          300: 'rgb(var(--ring-300))',
          400: 'rgb(var(--ring-400))',
          500: 'rgb(var(--ring-500))',
          600: 'rgb(var(--ring-600))',
          700: 'rgb(var(--ring-700))',
          800: 'rgb(var(--ring-800))',
          900: 'rgb(var(--ring-900))',
          950: 'rgb(var(--ring-950))',
        },

        /* Additional Status Colors */
        success: {
          DEFAULT: 'rgb(var(--success))',
          foreground: 'rgb(var(--success-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--success)) 85%, black)',
          100: 'rgb(var(--success-100))',
          200: 'rgb(var(--success-200))',
          300: 'rgb(var(--success-300))',
          400: 'rgb(var(--success-400))',
          500: 'rgb(var(--success-500))',
          600: 'rgb(var(--success-600))',
          700: 'rgb(var(--success-700))',
          800: 'rgb(var(--success-800))',
          900: 'rgb(var(--success-900))',
          950: 'rgb(var(--success-950))',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning))',
          foreground: 'rgb(var(--warning-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--warning)) 85%, black)',
          100: 'rgb(var(--warning-100))',
          200: 'rgb(var(--warning-200))',
          300: 'rgb(var(--warning-300))',
          400: 'rgb(var(--warning-400))',
          500: 'rgb(var(--warning-500))',
          600: 'rgb(var(--warning-600))',
          700: 'rgb(var(--warning-700))',
          800: 'rgb(var(--warning-800))',
          900: 'rgb(var(--warning-900))',
          950: 'rgb(var(--warning-950))',
        },

        /* Additional Base Colors */
        slate: {
          DEFAULT: 'rgb(var(--slate))',
          foreground: 'rgb(var(--slate-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--slate)) 85%, black)',
          50: 'rgb(var(--slate-50))',
          100: 'rgb(var(--slate-100))',
          200: 'rgb(var(--slate-200))',
          300: 'rgb(var(--slate-300))',
          400: 'rgb(var(--slate-400))',
          500: 'rgb(var(--slate-500))',
          600: 'rgb(var(--slate-600))',
          700: 'rgb(var(--slate-700))',
          800: 'rgb(var(--slate-800))',
          900: 'rgb(var(--slate-900))',
          950: 'rgb(var(--slate-950))',
        },
        stone: {
          DEFAULT: 'rgb(var(--stone))',
          foreground: 'rgb(var(--stone-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--stone)) 85%, black)',
          50: 'rgb(var(--stone-50))',
          100: 'rgb(var(--stone-100))',
          200: 'rgb(var(--stone-200))',
          300: 'rgb(var(--stone-300))',
          400: 'rgb(var(--stone-400))',
          500: 'rgb(var(--stone-500))',
          600: 'rgb(var(--stone-600))',
          700: 'rgb(var(--stone-700))',
          800: 'rgb(var(--stone-800))',
          900: 'rgb(var(--stone-900))',
          950: 'rgb(var(--stone-950))',
        },
        zinc: {
          DEFAULT: 'rgb(var(--zinc))',
          foreground: 'rgb(var(--zinc-foreground))',
          hover: 'color-mix(in srgb, rgb(var(--zinc)) 85%, black)',
          50: 'rgb(var(--zinc-50))',
          100: 'rgb(var(--zinc-100))',
          200: 'rgb(var(--zinc-200))',
          300: 'rgb(var(--zinc-300))',
          400: 'rgb(var(--zinc-400))',
          500: 'rgb(var(--zinc-500))',
          600: 'rgb(var(--zinc-600))',
          700: 'rgb(var(--zinc-700))',
          800: 'rgb(var(--zinc-800))',
          900: 'rgb(var(--zinc-900))',
          950: 'rgb(var(--zinc-950))',
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
