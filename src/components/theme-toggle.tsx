'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='flex items-center gap-2 text-foreground'>
      <span className='text-sm font-medium'>Theme</span>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className='p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors'
      >
        {theme === 'dark' ? (
          <Sun className='h-5 w-5 text-foreground' />
        ) : (
          <Moon className='h-5 w-5 text-foreground' />
        )}
        <span className='sr-only'>Toggle theme</span>
      </button>
    </div>
  );
}
