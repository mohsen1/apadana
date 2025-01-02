import { Listing, UploadedPhoto } from '@prisma/client';
import { AlertCircle, CheckCircle2, ExternalLink, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';

type ListingsGridProps = {
  listings: Array<Listing & { images?: UploadedPhoto[] }>;
};

const ListingsGrid = ({ listings }: ListingsGridProps) => {
  return (
    <div>
      <div className='mx-2 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-0 lg:grid-cols-2'>
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}/manage`}
            className='grid grid-rows-[1fr_auto_auto] overflow-hidden rounded-lg shadow-2xl transition-transform duration-300'
          >
            <div className='bg-zinc-300'>
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
              <div className='bg-background rounded-b-lg p-6'>
                <h2 className='text-card-foreground mb-2 text-2xl font-semibold'>
                  {listing.title}
                </h2>
                <div className='text-muted-foreground text-sm'>
                  <p>{listing.address}</p>
                  <p className='mt-2 font-medium'>
                    {formatCurrency(listing.pricePerNight, listing.currency)}/night
                  </p>
                </div>
              </div>
            </div>
            <div className='align-end flex min-h-10 justify-between gap-4 bg-zinc-300 p-6'>
              <div className='flex items-center'>
                {listing.published ? (
                  <>
                    <div className='text-success flex items-center'>
                      <CheckCircle2 className='mr-2 h-4 w-4' />
                      <span>Published</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='text-muted-foreground flex items-center'>
                      <AlertCircle className='mr-2 h-4 w-4' />
                      <span>Not Published</span>
                    </div>
                  </>
                )}
              </div>
              <Button href={`/listing/${listing.id}`} variant='link' target='_blank'>
                View
                <ExternalLink className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </Link>
        ))}
      </div>
      {/* big button to add listing */}
      <div className='mt-8 flex justify-center lg:mt-20'>
        <Button href='/listing/new' className='w-full max-w-48'>
          <Plus className='mr-2 h-4 w-4' />
          Add Another Listing
        </Button>
      </div>
    </div>
  );
};

export default ListingsGrid;
