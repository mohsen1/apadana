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
    <Avatar>
      <AvatarImage src={user?.imageUrl ?? ''} />
    </Avatar>
    Hello, {user?.firstName} {user?.lastName}
  </Button>
);

export function Nav() {
  const { user } = useAuth();

  return (
    <nav className='ml-auto flex gap-4 sm:gap-6'>
      {!user && <SignInButton />}
      {user && <UserButton user={user} />}
    </nav>
  );
}
