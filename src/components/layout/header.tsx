'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

import { Logo } from '@/components/Logo';
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
        'bg-background/75 supports-[backdrop-filter]:bg-background/60',
        'sticky top-0 z-50 flex h-16 items-center',
        'justify-between px-4 backdrop-blur-sm',
        'border-border border-b',
        className,
      )}
    >
      <div className='flex items-center gap-4'>
        <Link href='/' className='text-foreground flex items-center gap-2 whitespace-nowrap'>
          <Logo />
          <span className='font-outfit font-weight-400 text-2xl font-bold'>apadana</span>
          {isDev ? (
            <span className='text-muted-foreground font-outfit font-weight-700'>dev</span>
          ) : null}
        </Link>

        {user && (
          <div className='border-border hidden border-l pl-4 lg:flex lg:gap-6'>
            <LoggedInHeaderLinks />
          </div>
        )}
      </div>

      <div className='flex items-center gap-4'>
        <div className='hidden lg:flex'>
          {isDev && (
            <>
              <Button asChild variant='ghost' size='sm'>
                <Link
                  href='https://prisma_studio.apadana.localhost'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Prisma Studio
                </Link>
              </Button>
              <Button asChild variant='ghost' size='sm'>
                <Link
                  href='https://storybook.apadana.localhost'
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

        <MobileMenu />
      </div>
    </header>
  );
}

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className='hover:bg-accent'>
        <Button variant='ghost' size='icon' className='lg:hidden'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className='bg-background border-border'>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className='mt-4 flex flex-col gap-4'>
          <LoggedInHeaderLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
};
