'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className='hover:bg-secondary/80 flex items-center gap-2 rounded-md p-2 transition-colors'
    >
      {theme === 'dark' ? (
        <>
          Switch to light mode
          <Sun className='text-foreground h-5 w-5' />
        </>
      ) : (
        <>
          Switch to dark mode
          <Moon className='text-foreground h-5 w-5' />
        </>
      )}
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
