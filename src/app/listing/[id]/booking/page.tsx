import { notFound } from 'next/navigation';

import prisma from '@/lib/prisma/client';

export default async function BookingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await prisma.listing.findUnique({
    where: {
      id: Number(params.id),
    },
  });
  if (!listing) {
    return notFound();
  }
  return (
    <div>
      <pre>{JSON.stringify(listing, null, 2)}</pre>
    </div>
  );
}
