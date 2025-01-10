'use client';

import { Lock, LogOut, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ClientUser } from '@/contexts/auth-context';

const UserButton = ({ user }: { user: ClientUser }) => {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='flex items-center gap-2'>
          <span data-testid='nav-user-name' className='hidden sm:inline-flex'>
            {user.firstName} {user.lastName}
          </span>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.imageUrl || ''} />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='bg-background border-border w-56' align='end'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='cursor-pointer' asChild>
            <a href='/user'>
              <User className='mr-2 h-4 w-4' />
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className='cursor-pointer'>
            <a href='/user/security'>
              <Lock className='mr-2 h-4 w-4' />
              Security
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            router.push('/');
          }}
          className='cursor-pointer'
        >
          <LogOut className='mr-2 h-4 w-4' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Nav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isProd =
    process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_TEST_ENV !== 'e2e';

  return (
    <nav className='flex items-center gap-4' data-testid='main-nav'>
      {user ? (
        <UserButton user={user} data-testid='user-button' />
      ) : !isProd ? (
        <Button variant='default' size='sm' asChild data-testid='sign-in-button'>
          <a href={`/signin?redirect=${encodeURIComponent(pathname)}`}>Sign In</a>
        </Button>
      ) : null}
    </nav>
  );
}
