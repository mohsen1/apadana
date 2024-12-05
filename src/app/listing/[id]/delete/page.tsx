import prisma from '@/lib/prisma/client';

import { AuthBoundary } from '@/components/auth/AuthBoundary';

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
  return (
    <AuthBoundary protection={{ authRequired: true }} showAccessDenied>
      <DeleteListing listing={listing} />
    </AuthBoundary>
  );
}
