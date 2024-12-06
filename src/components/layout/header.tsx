'use server';

import { HomeIcon } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { LoggedInHeaderLinks } from '@/components/layout/LoggedInHeaderLinks';
import { Nav } from '@/components/layout/Nav';
import { Button } from '@/components/ui/button';

export async function Header({ className }: { className?: string }) {
  const isDev = process.env.NODE_ENV === 'development';

  const showHeaderLinks =
    process.env.NODE_ENV === 'development' ||
    process.env.TEST_ENV === 'e2e' ||
    process.env.TEST_ENV === 'unit';
  return (
    <header
      className={cn(
        'flex-1 px-4 lg:px-6 flex items-center bg-gray-100 dark:bg-gray-900',
        className,
      )}
    >
      <Head>
        <title>Apadana {isDev ? '(Dev)' : null}</title>
      </Head>
      <div>
        <Link href='/' legacyBehavior>
          <a className='flex gap-2 text-gray-800 dark:text-gray-200'>
            <HomeIcon className='h-6 w-6 text-gray-800 dark:text-gray-200' />
            <span className='font-bold'>Apadana {isDev ? '(Dev)' : null}</span>
          </a>
        </Link>
      </div>
      <div className='flex ml-10 border-l border-gray-300 dark:border-gray-700 pl-4'>
        {showHeaderLinks && <LoggedInHeaderLinks />}

        {showHeaderLinks && (
          <>
            <Button
              href='http://localhost:5555'
              variant='link'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-800 dark:text-gray-200'
            >
              Prisma Studio
            </Button>
            <Button
              href='http://localhost:6006'
              variant='link'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-800 dark:text-gray-200'
            >
              Storybook
            </Button>
            <Button
              href='/local-inbox'
              variant='link'
              className='text-gray-800 dark:text-gray-200'
            >
              Emails
            </Button>
          </>
        )}
      </div>
      {showHeaderLinks && <Nav />}
    </header>
  );
}
