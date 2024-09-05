import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { useTheme } from 'next-themes';

export function SpectrumProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Provider
      theme={defaultTheme}
      colorScheme={theme === 'dark' ? 'dark' : 'light'}
    >
      {children}
    </Provider>
  );
}
