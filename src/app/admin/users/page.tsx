import { Suspense } from 'react';

import { PaginationSchema } from '@/lib/schema';

import { EmptyState } from '@/components/common/EmptyState';
import Loading from '@/components/ui/loading';

import { getUsers } from '../actions';
import { UserList } from '../UserList';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ take: number; skip: number; search: string }>;
}) {
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
    <Suspense fallback={<Loading />}>
      <UserList {...getUsersResult.data} />
    </Suspense>
  );
}
