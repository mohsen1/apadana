import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      background: {
        DEFAULT: '#ffffff',
        dark: '#010101',
      },
      foreground: {
        DEFAULT: '#010101',
        dark: '#f9f9f9',
      },
      destructive: {
        DEFAULT: '#ef4444',
        dark: '#ef4444',
      },
      border: {
        DEFAULT: '#e0e0e0',
        dark: '#262626',
      },
      ...colors,
    },
  },
  plugins: [],
};

export default config;
