import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className='px-4 lg:px-6 h-14 flex items-center'>
      <div>
        <Link href='/' legacyBehavior>
          <a className='flex gap-2'>
            <HomeIcon className='h-6 w-6 ' />
            <span className='font-bold'>Make Your Own Listing</span>
          </a>
        </Link>
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
