'use client';

import { HomeIcon, Menu } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { LoggedInHeaderLinks } from './LoggedInHeaderLinks';
import { Nav } from './Nav';

export function Header({ className }: { className?: string }) {
  const isDev = process.env.NODE_ENV === 'development';

  const showHeaderLinks = true; // Always show for demo purposes

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

        <div className='hidden border-l border-gray-200 dark:border-gray-800 pl-4 lg:flex lg:gap-6'>
          {showHeaderLinks && <LoggedInHeaderLinks />}
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <div className='hidden lg:flex'>
          {showHeaderLinks && (
            <>
              <Button asChild variant='ghost' size='sm'>
                <Link
                  href='http://localhost:5555'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Prisma Studio
                </Link>
              </Button>
              <Button asChild variant='ghost' size='sm'>
                <Link
                  href='http://localhost:6006'
                  target='_blank'
                  rel='noopener noreferrer'
                >
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
        {showHeaderLinks && (
          <Sheet>
            <SheetTrigger
              asChild
              className='dark:hover:bg-background-dark dark:hover:text-foreground-dark'
            >
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
                <Button asChild variant='ghost' size='sm'>
                  <Link
                    href='http://localhost:5555'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Prisma Studio
                  </Link>
                </Button>
                <Button asChild variant='ghost' size='sm'>
                  <Link
                    href='http://localhost:6006'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Storybook
                  </Link>
                </Button>
                <Button asChild variant='ghost' size='sm'>
                  <Link href='/local-inbox'>Emails</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
