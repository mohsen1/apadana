'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export function Nav() {
  return (
    <nav className='ml-auto flex gap-4 sm:gap-6'>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  );
}
