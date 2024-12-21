import { Listing, UploadedPhoto } from '@prisma/client';
import Image from 'next/image';
import React from 'react';

import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';

type ListingsGridProps = {
  listings: Array<Listing & { images?: UploadedPhoto[] }>;
};

const ListingsGrid = ({ listings }: ListingsGridProps) => {
  return (
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
      {listings.map((listing) => (
        <div
          key={listing.id}
          className='bg-card grid grid-rows-[1fr_auto_auto] overflow-hidden rounded-lg shadow-lg transition-transform duration-300'
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
            <h2 className='text-card-foreground mb-2 text-2xl font-semibold'>{listing.title}</h2>
            <div className='text-muted-foreground text-sm'>
              <p>{listing.address}</p>
              <p className='mt-2 font-medium'>
                {formatCurrency(listing.pricePerNight, listing.currency)}/night
              </p>
            </div>
          </div>
          <div className='align-end flex min-h-10 justify-end gap-4 p-6'>
            <Button href={`/listing/${listing.id}/delete`} variant='link'>
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
