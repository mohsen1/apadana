import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className='px-4 lg:px-6 h-14 flex items-center'>
      <div>
        <Link href='/' legacyBehavior>
          <a className='flex gap-2'>
            <HomeIcon className='h-6 w-6 ' />
            <span className='font-bold'>Apadana</span>
          </a>
        </Link>
      </div>
      <div className='flex gap-4 sm:gap-6 ml-10 border-l border-slate-700 pl-4'>
        <SignedIn>
          <Button href='/listing' variant='link'>
            My Listings
          </Button>
        </SignedIn>
        <Button href='/listing/create' variant='link'>
          Create Listing
        </Button>
        {process.env.NODE_ENV === 'development' && (
          <Button
            href='http://localhost:5555'
            variant='link'
            target='_blank'
            rel='noopener noreferrer'
          >
            Prisma Studio
          </Button>
        )}
      </div>
      <nav className='ml-auto flex gap-4 sm:gap-6'>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
