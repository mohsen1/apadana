'use client';

import { HomeIcon, Menu } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { LoggedInHeaderLinks } from './LoggedInHeaderLinks';
import { Nav } from './Nav';

export function Header({ className }: { className?: string }) {
  const { user } = useAuth();
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center justify-between px-4 backdrop-blur-sm bg-white/75 dark:bg-gray-900/75 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60',
        'border-b border-gray-200 dark:border-gray-800',
        className,
      )}
    >
      <div className='flex items-center gap-4'>
        <Link
          href='/'
          className='flex items-center gap-2 whitespace-nowrap text-gray-800 dark:text-gray-200'
        >
          <HomeIcon className='h-6 w-6' />
          <span className='font-bold'>Apadana {isDev ? '(Dev)' : null}</span>
        </Link>

        {user && (
          <div className='hidden border-l border-gray-200 dark:border-gray-800 pl-4 lg:flex lg:gap-6'>
            <LoggedInHeaderLinks />
          </div>
        )}
      </div>

      <div className='flex items-center gap-4'>
        <div className='hidden lg:flex'>
          {isDev && (
            <>
              <Button asChild variant='ghost' size='sm'>
                <Link href='/__dev-only__/prisma-studio' target='_blank' rel='noopener noreferrer'>
                  Prisma Studio
                </Link>
              </Button>
              <Button asChild variant='ghost' size='sm'>
                <Link href='/__dev-only__/storybook' target='_blank' rel='noopener noreferrer'>
                  Storybook
                </Link>
              </Button>
              <Button asChild variant='ghost' size='sm'>
                <Link href='/local-inbox'>Emails</Link>
              </Button>
            </>
          )}
        </div>

        <Nav />

        {/* Mobile Menu */}

        <Sheet>
          <SheetTrigger asChild className='dark:hover:bg-background-dark dark:hover:-dark'>
            <Button variant='ghost' size='icon' className='lg:hidden'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className='bg-background dark:bg-background-dark dark:border-border-dark'>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className='flex flex-col gap-4 mt-4'>
              <LoggedInHeaderLinks />
              {isDev && (
                <>
                  <Button asChild variant='ghost' size='sm'>
                    <Link
                      href='/__dev-only__/prisma-studio'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Prisma Studio
                    </Link>
                  </Button>
                  <Button asChild variant='ghost' size='sm'>
                    <Link href='/__dev-only__/storybook' target='_blank' rel='noopener noreferrer'>
                      Storybook
                    </Link>
                  </Button>
                  <Button asChild variant='ghost' size='sm'>
                    <Link href='/local-inbox'>Emails</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
