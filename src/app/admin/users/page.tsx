import { Suspense } from 'react';

import { PaginationQueryParamsSchema } from '@/lib/schema';

import { EmptyState } from '@/components/common/EmptyState';
import Loading from '@/components/ui/loading';

import { getUsers } from '../actions';
import { UserList } from '../UserList';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    take: string;
    skip: string;
    search: string;
  }>;
}) {
  const paramsParsed = PaginationQueryParamsSchema.safeParse(await searchParams);

  let take = 10;
  let skip = 0;
  let search = '';

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
