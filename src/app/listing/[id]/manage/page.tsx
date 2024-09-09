import prisma from '@/lib/prisma/client';

import { ManageListingPage } from '@/app/listing/[id]/manage/ManageListingPage';
import NotFound from '@/app/not-found';

export default async function ManageListingPageServer({
  params,
}: {
  params: { id: string };
}) {
  const listing = await prisma.listing.findUnique({
    where: {
      id: parseInt(params.id),
    },
    include: {
      images: true,
      owner: true,
      inventory: true,
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

  return <ManageListingPage listingData={listing} />;
}
