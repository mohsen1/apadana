'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='text-foreground flex items-center gap-2'>
      <span className='text-sm font-medium'>Theme</span>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className='bg-secondary hover:bg-secondary/80 rounded-md p-2 transition-colors'
      >
        {theme === 'dark' ? (
          <Sun className='text-foreground h-5 w-5' />
        ) : (
          <Moon className='text-foreground h-5 w-5' />
        )}
        <span className='sr-only'>Toggle theme</span>
      </button>
    </div>
  );
}
