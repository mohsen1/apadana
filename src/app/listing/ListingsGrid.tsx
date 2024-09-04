import { Listing, UploadThingImage } from '@prisma/client';
import Image from 'next/image';
import React from 'react';

type ListingsGridProps = {
  listings: Array<Listing & { images?: UploadThingImage[] }>;
};

const ListingsGrid = ({ listings }: ListingsGridProps) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
      {listings.map((listing) => (
        <div
          key={listing.id}
          className='bg-card shadow-lg rounded-lg overflow-hidden transition-transform duration-300'
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
              <p className='font-medium'>${listing.pricePerNight} / night</p>
              <p>{listing.address}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingsGrid;
