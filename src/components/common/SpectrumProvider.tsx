'use client';

import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { Theme } from '@react-types/provider';
import { useTheme } from 'next-themes';

interface SpectrumProviderProps {
  children: React.ReactNode;
}

const APADANA_THEME_CLASS = 'spectrum-global--apanda';

/**
 * The way Adobe Spectrum Theme works is that it provides the
 * classes in the theme object to the theme provider and all of the
 * CSS variables in the theme class or any other class provided will take
 * effect on the Spectrum components.
 *
 * This function appends the theme class to the theme object so that the
 * CSS variables in the theme class or any other class provided will take
 * effect on the Spectrum components.
 *
 * @see https://react-spectrum.adobe.com/react-spectrum/theming.html#how-themes-are-defined
 */
function appendThemeClass(theme: Theme, themeClass: string): Theme {
  const result: Theme = { ...theme };

  for (const [key, value] of Object.entries(theme) as [keyof Theme, unknown][]) {
    if (value && typeof value === 'object') {
      // Create a new object for this key if it doesn't exist
      result[key] = { ...result[key] };

      // Type assertion since we know value is a Record<string, string>
      const themeSection = value as Record<string, string>;

      for (const [subKey, subValue] of Object.entries(themeSection)) {
        if (typeof subValue === 'string') {
          // Safe access using type assertion since we created the object above
          (result[key] as Record<string, string>)[subKey] = `${subValue} ${themeClass}`.trim();
        }
      }
    }
  }

  return result;
}

export function SpectrumProvider({ children }: SpectrumProviderProps) {
  const { theme } = useTheme();

  return (
    <Provider
      theme={appendThemeClass(defaultTheme, APADANA_THEME_CLASS)}
      colorScheme={theme === 'dark' ? 'dark' : 'light'}
    >
      {children}
    </Provider>
  );
}
