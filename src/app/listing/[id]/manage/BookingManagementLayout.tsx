import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';

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
      <div className='relative mb-4 h-32'>
        <div className='verflow-hidden absolute inset-y-0 right-0 w-full'>
          <Image src={listing.images[0].url} alt='' fill className='object-cover' priority />
        </div>

        <div className='relative h-full py-4'>
          <div className='flex flex-col items-start gap-2 px-4 py-2'>
            <OverBlurryImageTextWithTextShadow className='max-w-[calc(100%-2rem)]'>
              <h1 className='text-foreground overflow-hidden truncate  text-2xl font-bold lg:text-3xl'>
                {listing.title}
              </h1>
            </OverBlurryImageTextWithTextShadow>
            <Button
              variant='link'
              href={`/listing/${id}`}
              className='inline-blockflex ml-auto w-auto gap-2 px-0'
            >
              <OverBlurryImageText className='flex items-center'>
                <span>View listing</span>
                <ArrowRight className='h-4 w-4' />
              </OverBlurryImageText>
            </Button>
          </div>
        </div>
      </div>

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

function OverBlurryImageTextWithTextShadow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('text-foreground', className)}
      style={{
        textShadow: `
          0 0 1px hsl(var(--background)),
          0 0 5px hsl(var(--background) / 0.55),
          0 0 5px hsl(var(--background) / 0.6)
        `,
      }}
    >
      {children}
    </div>
  );
}

function OverBlurryImageText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative inline-block rounded-md backdrop-blur-xl',
        'bg-background/30 flex items-center gap-2 px-4 py-2',
        'text-foreground shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
