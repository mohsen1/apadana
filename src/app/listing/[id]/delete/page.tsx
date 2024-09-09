import { TrashIcon } from 'lucide-react';
import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma/client';

import { Button } from '@/components/ui/button';

import NotFound from '@/app/not-found';

async function deleteListing(formData: FormData) {
  'use server';
  const id = formData.get('id');
  if (typeof id === 'string') {
    const listingId = parseInt(id);

    await prisma.$transaction(async (tx) => {
      // Delete associated images first
      await tx.uploadThingImage.deleteMany({
        where: { listingId: listingId },
      });

      // Then delete the listing
      await tx.listing.delete({
        where: { id: listingId },
      });
    });
  }
  redirect('/listing');
}

export default async function DeleteListingPage({
  params,
}: {
  params: { id: string };
}) {
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
    <form
      className='max-w-4xl mx-auto pt-12 p-6 space-y-8 flex-grow'
      action={deleteListing}
    >
      <h1 className='text-2xl font-bold flex items-center gap-2'>
        <TrashIcon className='text-destructive' size={48} />
        Delete {listing.title}
      </h1>

      <div className='flex items-center gap-2'>
        <p>
          Are you sure you want to delete this listing? This action cannot be
          undone.
        </p>
      </div>
      <input type='hidden' name='id' value={listing.id} />
      <div className='flex justify-end gap-4'>
        <Button variant='outline' href='/listing'>
          Cancel
        </Button>
        <Button type='submit' variant='destructive'>
          Delete
        </Button>
      </div>
    </form>
  );
}
