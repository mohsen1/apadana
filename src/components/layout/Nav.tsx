'use client';

import { LogOut, Settings, User } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center gap-2 dark:hover:bg-background-dark dark:hover:-dark'
        >
          <span className='hidden sm:inline-flex'>
            Hello, {user.firstName} {user.lastName}
          </span>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.imageUrl || ''} />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56 bg-background border-border  dark:bg-background-dark dark:-dark dark:border-border-dark'
        align='end'
      >
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
            <a href='/settings'>
              <Settings className='mr-2 h-4 w-4' />
              Settings
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} className='cursor-pointer'>
          <LogOut className='mr-2 h-4 w-4' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Nav() {
  const { user } = useAuth();
  const isProd = process.env.NODE_ENV === 'production';

  return (
    <nav className='flex items-center gap-4'>
      {user ? (
        <UserButton user={user} />
      ) : !isProd ? (
        <Button variant='default' size='sm' asChild>
          <a href='/sign-in'>Sign In</a>
        </Button>
      ) : null}
    </nav>
  );
}
