'use client';

import Image from 'next/image';
import React from 'react';

import { FullListing } from '@/lib/types';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Bookings } from '@/app/listing/[id]/manage/Bookings';
import { HostCalendar } from '@/app/listing/[id]/manage/HostCalendar';
import UpdateListingForm from '@/app/listing/[id]/manage/UpdateListingForm';

export type ManageListingPageProps = {
  listingData: FullListing;
};

export function ManageListingPage({ listingData }: ManageListingPageProps) {
  return (
    <div className='container mx-auto p-4 flex-grow'>
      <h1 className='text-3xl font-bold mb-6'>
        <Image
          src={listingData.images[0].url}
          alt={listingData.title}
          width={96}
          height={96}
          className='inline object-cover mr-2'
        />
        <span>Manage "{listingData.title}"</span>
      </h1>
      <Tabs defaultValue='calendar' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='calendar'>Calendar</TabsTrigger>
          <TabsTrigger value='details'>Details</TabsTrigger>
          <TabsTrigger value='bookings'>Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value='calendar'>
          <HostCalendar listingData={listingData} />
        </TabsContent>
        <TabsContent value='details'>
          <UpdateListingForm listing={listingData} />
        </TabsContent>
        <TabsContent value='bookings'>
          <Bookings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
