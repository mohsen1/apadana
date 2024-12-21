import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function ManageListingPageLayout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string; tab: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const { id, tab } = params;

  const res = await getListing({ id });
  if (!res?.data?.listing) {
    throw new Error('Failed to get listing');
  }
  const listing = res.data.listing;

  if (!listing) {
    return <NotFound title='Listing not found' />;
  }

  return (
    <div className='container mx-auto flex-grow p-4'>
      <h1 className='mb-6 text-3xl font-bold'>
        <Link href={`/listing/${id}`}>
          <Image
            src={listing.images[0].url}
            alt={listing.title}
            width={96}
            height={96}
            className='mr-2 inline object-cover'
          />
          <span>Manage "{listing.title.slice()}"</span>
          <Button variant='outline' size='icon' className='ml-6'>
            <Link href={`/listing/${id}`}>
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </Link>
      </h1>
      <Tabs defaultValue={tab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='calendar'>
            <Link href={`/listing/${id}/manage/calendar`}>Calendar</Link>
          </TabsTrigger>
          <TabsTrigger value='details'>
            <Link href={`/listing/${id}/manage/details`}>Details</Link>
          </TabsTrigger>
          <TabsTrigger value='photos'>
            <Link href={`/listing/${id}/manage/photos`}>Photos</Link>
          </TabsTrigger>
          <TabsTrigger value='bookings'>
            <Link href={`/listing/${id}/manage/bookings`}>Bookings</Link>
          </TabsTrigger>
          <TabsTrigger value='booking-requests'>
            <Link href={`/listing/${id}/manage/booking-requests`}>Booking Requests</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>{children}</TabsContent>
      </Tabs>
    </div>
  );
}
