'use client';

import { useAuth } from '@/hooks/use-auth';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import type { ClientUser } from '@/contexts/auth-context';

const SignInButton = () => (
  <Button variant='link' href='/sign-in'>
    Sign In
  </Button>
);

const UserButton = ({ user }: { user: ClientUser | null }) => (
  <Button variant='link' href='/user'>
    <span className='flex mr-2 items-center gap-2'>
      Hello, {user?.firstName} {user?.lastName}
    </span>
    <Avatar>
      <AvatarImage src={user?.imageUrl ?? ''} />
    </Avatar>
  </Button>
);

export function Nav() {
  const { user } = useAuth();

  return (
    <nav className='ml-auto flex gap-4 sm:gap-6'>
      {/* Hiding sign in button until launch */}
      {user && <UserButton user={user} />}
      {!user && <SignInButton />}
    </nav>
  );
}
