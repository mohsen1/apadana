import prisma from '@/lib/prisma/client';

import { ListingPage } from '@/app/listing/[id]/ListingPage';
import NotFound from '@/app/not-found';

export default async function Page({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findFirst({
    where: {
      id: parseInt(params?.id, 10),
    },
    include: {
      images: true,
      owner: true,
    },
  });

  if (!listing) {
    return (
      <NotFound
        title='Listing Not Found'
        message='The listing you are looking for does not exist.'
      />
    );
  }

  return <ListingPage listingData={listing} />;
}
