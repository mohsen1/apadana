'use client';

import { Menu, Shield, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      className={cn(
        'flex w-full items-center justify-start rounded-none p-2 text-left',
        'rounded-l-lg',
        isActive
          ? 'bg-secondary hover:bg-secondary dark:bg-secondary dark:hover:bg-secondary'
          : 'hover:bg-secondary/50 hover:text-primary dark:hover:bg-secondary/50 dark:hover:text-primary',
      )}
    >
      {children}
    </Button>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className='relative min-h-screen'>
      {/* Mobile Menu Button */}
      <Button
        variant='ghost'
        className='absolute left-4 top-4 lg:hidden'
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className='h-6 w-6' />
      </Button>

      <div className='flex min-h-screen flex-col lg:flex-row'>
        {/* Sidebar */}
        <div
          className={cn(
            'border-border w-full border-b p-6 lg:w-64 lg:min-w-64 lg:border-b-0 lg:border-r',
            'bg-background fixed top-0 z-50 lg:relative',
            'transition-transform duration-200 ease-in-out',
            isSidebarOpen ? 'translate-y-0' : '-translate-y-[150%] lg:translate-y-0',
          )}
        >
          <h1 className='text-2xl font-semibold'>Account</h1>
          <p className='text-muted-foreground mt-1 text-sm'>Manage your account info.</p>

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
        <div className='w-full pt-16 lg:pt-0'>{children}</div>
      </div>
    </div>
  );
}
