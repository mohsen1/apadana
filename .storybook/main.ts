import type { StorybookConfig } from '@storybook/nextjs';
import autoprefixer from 'autoprefixer';
import tailwindCss from 'tailwindcss';

import taildwindConfig from '../config/tailwind.config';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      strictMode: false,
    },
  },
  staticDirs: ['../public'],
  logLevel: 'error',
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/router': 'next-router-mock',
        'next/navigation': 'next-router-mock',
      };
    }

    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    tailwindCss,
                    {
                      config: taildwindConfig,
                    },
                  ],

                  autoprefixer,
                ],
              },
            },
          },
        ],
      });
    }
    return config;
  },
};
export default config;
