'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='flex items-center gap-2 text-black dark:text-white'>
      <span className='text-sm font-medium'>Theme</span>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className='p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors'
      >
        {theme === 'dark' ? (
          <Sun className='h-5 w-5 text-gray-100' />
        ) : (
          <Moon className='h-5 w-5 text-gray-800' />
        )}
        <span className='sr-only'>Toggle theme</span>
      </button>
    </div>
  );
}
