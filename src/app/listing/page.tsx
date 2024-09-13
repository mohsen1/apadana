import { Button } from '@/components/ui/button';

import { getListings } from '@/app/listing/[id]/manage/action';
import NotFound from '@/app/not-found';

import ListingsGrid from './ListingsGrid';

export default async function ListingsPage() {
  const res = await getListings({});
  if (!res?.data?.success) {
    throw res?.data?.error || new Error('Failed to get listings');
  }
  const { listings } = res.data;

  if (!listings) {
    return <NotFound title='No listings found' />;
  }

  return (
    <div className='bg-background min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <main className='py-12'>
          <h1 className='text-5xl font-extrabold mb-8 text-foreground'>
            All Listings
          </h1>
          {listings.length === 0 ? (
            <div className='text-center py-6'>
              <p className='text-lg text-muted-foreground pb-4'>
                No listings were found
              </p>
              <Button href='/listing/create'>Create a listing</Button>
            </div>
          ) : (
            <ListingsGrid listings={listings} />
          )}
        </main>
      </div>
    </div>
  );
}
