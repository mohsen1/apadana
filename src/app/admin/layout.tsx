import { Role } from '@prisma/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserInServer } from '@/lib/auth';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserInServer();

  if (!user?.roles.some((role) => role.role === Role.ADMIN)) {
    redirect('/');
  }

  return (
    <div className='container mx-auto max-w-4xl px-2 py-8'>
      <h1 className='mb-8 text-2xl font-bold'>Admin Dashboard</h1>
      <Tabs defaultValue='users' className='w-full'>
        <TabsList className='mb-8'>
          <TabsTrigger asChild value='users'>
            <Button variant='ghost' asChild>
              <Link href='/admin/users'>Users</Link>
            </Button>
          </TabsTrigger>
          <TabsTrigger asChild value='early-signups'>
            <Button variant='ghost' asChild>
              <Link href='/admin/early-signups'>Early Signups</Link>
            </Button>
          </TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
