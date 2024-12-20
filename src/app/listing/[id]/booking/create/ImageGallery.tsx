'use client';
import Image from 'next/image';
import { useState } from 'react';

import { PublicListing } from '@/lib/types';

export function ImageGallery({ listing }: { listing: PublicListing }) {
  const [mainImage, setMainImage] = useState(0);
  return (
    <div className='lg:w-3/4'>
      <div className='relative aspect-video mb-4'>
        <Image
          src={listing.images[mainImage].url}
          alt={`Listing image ${listing.images[mainImage].name}`}
          fill
          className='object-cover rounded-lg'
        />
      </div>
      <div className='grid grid-cols-4 gap-2'>
        {listing.images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(index)}
            className={`relative aspect-video ${index === mainImage ? 'ring-2 ring-primary' : ''}`}
          >
            <Image src={img.url} alt={img.name ?? ''} fill className='object-cover rounded-md' />
          </button>
        ))}
      </div>
      <h2 className='text-2xl pt-6 pb-2  mb-2 font-bold font-heading'>{listing.title}</h2>
      <div className='mt-4'>{listing.description}</div>
    </div>
  );
}
