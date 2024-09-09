import { Listing, UploadThingImage } from '@prisma/client';
import Image from 'next/image';
import React from 'react';

import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';

type ListingsGridProps = {
  listings: Array<Listing & { images?: UploadThingImage[] }>;
};

const ListingsGrid = ({ listings }: ListingsGridProps) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
      {listings.map((listing) => (
        <div
          key={listing.id}
          className='bg-card shadow-lg rounded-lg overflow-hidden transition-transform duration-300 grid grid-rows-[1fr_auto_auto]'
        >
          <div className='relative h-48'>
            {listing.images && listing.images[0] && (
              <Image
                src={listing.images[0].url}
                alt={listing.title}
                layout='fill'
                objectFit='cover'
              />
            )}
          </div>
          <div className='p-6'>
            <h2 className='text-2xl font-semibold mb-2 text-card-foreground'>
              {listing.title}
            </h2>
            <p className='text-muted-foreground mb-4 line-clamp-2'>
              {listing.description}
            </p>
            <div className='flex justify-between items-center text-sm text-muted-foreground'>
              <p className='font-medium'>
                {formatCurrency(listing.pricePerNight, listing.currency)}
              </p>
              <p>{listing.address}</p>
            </div>
          </div>
          <div className='p-6 min-h-10 flex justify-end align-end gap-4'>
            <Button
              href={`/listing/${listing.id}/delete`}
              variant='softDestructive'
            >
              Delete
            </Button>
            <Button href={`/listing/${listing.id}`} variant='secondary'>
              View
            </Button>
            <Button href={`/listing/${listing.id}/manage`}>Manage</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingsGrid;
