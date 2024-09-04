import { PrismaClient } from '@prisma/client';

import ListingsGrid from './ListingsGrid';

const prisma = new PrismaClient();

async function getListings() {
  const listings = await prisma.listing.findMany({
    include: {
      images: true,
    },
  });
  return listings;
}

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <div className='bg-background min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <main className='py-12'>
          <h1 className='text-5xl font-extrabold mb-8 text-foreground'>
            All Listings
          </h1>
          <ListingsGrid listings={listings} />
        </main>
      </div>
    </div>
  );
}
