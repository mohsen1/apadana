import prisma from '@/lib/prisma/client';

import { DeleteListing } from '@/app/listing/[id]/delete/DeleteListing';
import NotFound from '@/app/not-found';

export default async function DeleteListingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const listing = await prisma.listing.findUnique({
    where: {
      id: parseInt(params.id),
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
  return <DeleteListing listing={listing} />;
}
