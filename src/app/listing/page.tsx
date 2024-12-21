import { Button } from '@/components/ui/button';

import { getListings } from '@/app/listing/[id]/manage/action';
import NotFound from '@/app/not-found';

import ListingsGrid from './ListingsGrid';

export const dynamic = 'force-dynamic';

export default async function ListingsPage() {
  const res = await getListings({});
  if (!res?.data?.listings) {
    throw new Error('Failed to get listings');
  }
  const { listings } = res.data;

  if (!listings) {
    return <NotFound title='No listings found' />;
  }

  return (
    <div className='container mx-auto pt-10'>
      <h1 className='mb-8 text-3xl font-extrabold'>My Listings</h1>
      {listings.length === 0 ? (
        <div className='py-6 text-center'>
          <p className='text-muted-foreground pb-4 text-lg'>No listings were found</p>
          <Button href='/listing/create'>Create a listing</Button>
        </div>
      ) : (
        <ListingsGrid listings={listings} />
      )}
    </div>
  );
}
