import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

// Use absolute paths for content so when config is imported by
// Storybook, it can find the files
const content = [
  'src/**/*.{js,ts,jsx,tsx,mdx}',
  'app/**/*.{js,ts,jsx,tsx,mdx}',
  '.storybook/**/*.{js,ts,jsx,tsx,mdx}',
].map((path) => `${process.cwd()}/${path}`);

const config: Config = {
  content,
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
      zinc: colors.zinc,
      inherit: 'inherit',
      current: 'currentColor',
      transparent: 'transparent',
      black: '#000',
      white: '#fff',
      slate: colors.slate,
      gray: colors.gray,
      neutral: colors.neutral,
      stone: colors.stone,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.yellow,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
    },
  },
  plugins: [],
};

export default config;
