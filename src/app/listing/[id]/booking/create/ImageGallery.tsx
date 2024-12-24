'use client';
import Image from 'next/image';
import { useState } from 'react';

import { PublicListing } from '@/lib/types';

export function ImageGallery({ listing }: { listing: PublicListing }) {
  const [mainImage, setMainImage] = useState(0);
  return (
    <div className='lg:w-3/4'>
      <div className='relative mb-4 aspect-video'>
        <Image
          src={listing.images[mainImage].url}
          alt={`Listing image ${listing.images[mainImage].name}`}
          fill
          className='rounded-lg object-cover'
        />
      </div>
      <div className='grid grid-cols-4 gap-2'>
        {listing.images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(index)}
            className={`relative aspect-video ${index === mainImage ? 'ring-primary ring-2' : ''}`}
          >
            <Image src={img.url} alt={img.name ?? ''} fill className='rounded-md object-cover' />
          </button>
        ))}
      </div>
      <h2 className='font-heading text-foreground mb-2 pb-2 pt-6 text-2xl font-bold'>
        {listing.title}
      </h2>
      <div className='text-muted-foreground mt-4'>{listing.description}</div>
    </div>
  );
}
