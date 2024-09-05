import prisma from '@/lib/prisma/client';

import { ListingPage } from '@/app/listing/[id]/ListingPage';

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
  return <ListingPage listingData={listing} />;
}
