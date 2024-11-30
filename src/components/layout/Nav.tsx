'use client';

// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import type { User } from '@prisma/client';

import { useAuth } from '@/hooks/use-auth';

import { AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const SignInButton = () => (
  <Button variant='link' href='/sign-in'>
    Sign In
  </Button>
);

const UserButton = ({ user }: { user: User | null }) => (
  <Button variant='link' href='/user'>
    <AvatarImage src={user?.imageUrl ?? ''} />
    {user?.firstName} {user?.lastName}
  </Button>
);

export function Nav() {
  const { isSignedIn, user } = useAuth();

  return (
    <nav className='ml-auto flex gap-4 sm:gap-6'>
      {!isSignedIn && <SignInButton />}
      {isSignedIn && <UserButton user={user} />}
    </nav>
  );
}
