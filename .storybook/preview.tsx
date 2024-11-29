import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview, ReactRenderer } from '@storybook/react';
import { Decorator } from '@storybook/react';
import * as React from 'react';

import '../src/styles/globals.css';

import { fontHeading, fontSans, fontSubheading } from '../src/app/fonts';
import { ThemeProvider } from '../src/components/theme-provider';
import { cn } from '../src/lib/utils';

const withProviders: Decorator = (StoryFn) => {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
      <div
        data-storybook-wrapper
        className={cn(
          'font-sans antialiased',
          fontSans.variable,
          fontHeading.variable,
          fontSubheading.variable,
        )}
      >
        <StoryFn />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    withProviders,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
