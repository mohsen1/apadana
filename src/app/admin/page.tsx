import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { getUserInServer } from '@/lib/auth';
import { PaginationSchema } from '@/lib/schema';

import { EmptyState } from '@/components/common/EmptyState';
import Loading from '@/components/ui/loading';

import { getUsers } from '@/app/admin/actions';
import { UserList } from '@/app/admin/UserList';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ take: number; skip: number; search: string }>;
}) {
  const user = await getUserInServer();

  if (!user?.roles.some((role) => role.role === Role.ADMIN)) {
    redirect('/');
  }
  let take = 10;
  let skip = 0;
  let search = '';

  const paramsParsed = PaginationSchema.safeParse(await params);

  if (paramsParsed.success) {
    take = paramsParsed.data.take;
    skip = paramsParsed.data.skip;
    search = paramsParsed.data.search ?? '';
  }

  const getUsersResult = await getUsers({
    take,
    skip,
    search,
  });

  if (!getUsersResult?.data?.users?.length) {
    return <EmptyState>No users found</EmptyState>;
  }

  return (
    <div className='container max-w-4xl px-2 py-8'>
      <h1 className='mb-8 text-2xl font-bold'>Admin Dashboard</h1>
      <Suspense fallback={<Loading />}>
        <UserList {...getUsersResult.data} />
      </Suspense>
    </div>
  );
}
