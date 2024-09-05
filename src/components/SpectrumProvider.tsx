'use client';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function SpectrumProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const incomingTheme = theme as 'light' | 'dark' | 'system' | undefined;
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(
    incomingTheme === 'system' ? undefined : incomingTheme,
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const matches = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = matches.matches ? 'dark' : 'light';
      setColorScheme(
        theme === 'system' ? systemTheme : (theme as 'light' | 'dark'),
      );

      const handleChange = (e: MediaQueryListEvent) => {
        if (theme === 'system') {
          setColorScheme(e.matches ? 'dark' : 'light');
        }
      };

      matches.addEventListener('change', handleChange);
      return () => matches.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <Provider theme={defaultTheme} colorScheme={colorScheme}>
      {children}
    </Provider>
  );
}
