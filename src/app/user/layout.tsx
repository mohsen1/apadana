'use client';

import { Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='w-64 min-w-64 border-r p-6'>
        <h1 className='text-2xl font-semibold'>Account</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Manage your account info.
        </p>

        <div className='mt-8 space-y-2'>
          <Link
            href='/user/profile'
            className={`flex items-center w-full p-2 rounded-md ${
              pathname === '/user/profile'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <User className='mr-2 h-4 w-4' />
            Profile
          </Link>
          <Link
            href='/user/security'
            className={`flex items-center w-full p-2 rounded-md ${
              pathname === '/user/security'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Shield className='mr-2 h-4 w-4' />
            Security
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
