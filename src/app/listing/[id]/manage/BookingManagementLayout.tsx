import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

interface BookingManagementLayoutProps {
  children: React.ReactNode;
  id: string;
  tab: 'calendar' | 'bookings' | 'details' | 'photos' | 'booking-requests';
}
// We can't use "layout.tsx" due to this stupid Next.js limitation
// https://github.com/vercel/next.js/issues/43704
export async function BookingManagementLayout({ children, id, tab }: BookingManagementLayoutProps) {
  const res = await getListing({ id });
  if (!res?.data?.listing) {
    throw new Error('Failed to get listing');
  }
  const listing = res.data.listing;

  if (!listing) {
    return <NotFound title='Listing not found' />;
  }

  return (
    <div className='container mx-auto flex-grow'>
      <Link href={`/listing/${id}`} className='grid grid-cols-[96px_1fr] items-start gap-2 p-2'>
        <Image
          src={listing.images[0].url}
          alt={listing.title}
          width={96}
          height={96}
          className='mr-2 inline aspect-square object-cover'
        />
        <div className='flex flex-col items-start justify-start'>
          <span className='bold overflow-hidden truncate text-3xl'>{listing.title}</span>
          <Button variant='link' href={`/listing/${id}`} className='flex items-center gap-2 px-0'>
            <span>View listing</span>
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </Link>
      <Tabs defaultValue={tab} className='w-full space-y-4'>
        <TabsList className='w-full overflow-y-auto'>
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
        <TabsContent className='p-0' value={tab}>
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}
