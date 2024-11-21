import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma/client';

import { getListing } from '@/app/listing/action';

export async function deleteListing(formData: FormData) {
  'use server';
  const id = formData.get('id');
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  if (typeof id === 'string') {
    const listingId = parseInt(id, 10);
    const res = await getListing({ id: listingId });

    if (!res?.data?.success) {
      throw new Error(res?.data?.error);
    }

    const listing = res.data.listing;

    if (!listing) {
      return new Response('Listing Not Found', { status: 404 });
    }

    if (listing.ownerId !== userId) {
      return new Response('Listing Not Found', { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete associated images
      await tx.uploadThingImage.deleteMany({
        where: { listingId },
      });

      // Delete related booking requests
      await tx.bookingRequest.deleteMany({
        where: { listingId },
      });

      // Delete listing inventory
      await tx.listingInventory.deleteMany({
        where: { listingId },
      });

      // Finally, delete the listing
      await tx.listing.delete({
        where: { id: listingId },
      });
    });
  }

  redirect('/listing');
}
