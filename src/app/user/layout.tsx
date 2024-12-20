'use client';

import { Shield, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

function SidebarButton({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant='ghost'
      href={href}
      className={`flex items-center justify-start w-full p-2  rounded-none text-left ${
        isActive
          ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-500-foreground dark:hover:text-sky-500'
      }`}
    >
      {children}
    </Button>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='w-64 min-w-64 border-r border-gray-200 dark:border-gray-800 p-6'>
        <h1 className='text-2xl font-semibold'>Account</h1>
        <p className='text-sm text-muted-foreground mt-1'>Manage your account info.</p>

        <div className='mt-8 space-y-2'>
          <SidebarButton href='/user/profile' isActive={pathname === '/user/profile'}>
            <User className='mr-2 h-4 w-4' />
            Profile
          </SidebarButton>
          <SidebarButton href='/user/security' isActive={pathname === '/user/security'}>
            <Shield className={cn('mr-2 h-4 w-4')} />
            Security
          </SidebarButton>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
