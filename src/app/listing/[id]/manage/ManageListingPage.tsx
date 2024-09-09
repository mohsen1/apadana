'use client';

import {
  Listing,
  ListingInventory,
  UploadThingImage,
  User,
} from '@prisma/client';
import { DollarSign, Loader2, SaveIcon } from 'lucide-react';
import Image from 'next/image';
import { useAction } from 'next-safe-action/hooks';
import React, { useState } from 'react';

import { areEqualDates } from '@/lib/utils';

import { AvailabilityManagementCalendar } from '@/components/AvailabilityManagementCalendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { editInventory, getListing } from '@/app/listing/[id]/manage/action';
import UpdateListingForm from '@/app/listing/[id]/manage/UpdateListingForm';

export function ManageListingPage({
  listingData,
}: {
  listingData: Listing & {
    images: UploadThingImage[];
    owner: User;
    inventory: ListingInventory[];
  };
}) {
  const [listingInventory, setListingInventory] = useState<ListingInventory[]>(
    listingData.inventory,
  );
  const [date, setDate] = useState<Date>(new Date());
  const [datePrice, setDatePrice] = useState<number>(listingData.pricePerNight);
  const [dateAvailable, setDateAvailable] = useState<boolean>(false);
  const { execute: executeEditInventory, status: editInventoryStatus } =
    useAction(editInventory);

  async function refreshInventory() {
    const res = await getListing({ id: listingData.id });
    if (res?.data?.listing) {
      setListingInventory(res.data.listing.inventory);
    }
  }

  return (
    <div className='container mx-auto p-4'>
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
          <Card className='box-shadow-none border-none'>
            <CardHeader>
              <CardTitle>Manage Calendar</CardTitle>
              <CardDescription>Set availability and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid lg:grid-cols-[1fr_auto] gap-4'>
                <div className=''>
                  <AvailabilityManagementCalendar
                    value={date}
                    listing={{
                      ...listingData,
                      inventory: listingInventory,
                    }}
                    onDateChange={(newDate) => {
                      setDate(newDate);
                      const inventory = listingInventory.find((inventory) =>
                        areEqualDates(inventory.date, newDate),
                      );
                      if (!inventory) {
                        setDatePrice(listingData.pricePerNight);
                        setDateAvailable(false);
                        return;
                      }
                      setDateAvailable(inventory.isBooked);
                      setDatePrice(inventory.price);
                    }}
                  />
                </div>
                <div className='min-w-[300px] space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='datePrice'>
                      Price for {date?.toDateString()}
                    </Label>
                    <div className='relative'>
                      <DollarSign className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input
                        disabled={editInventoryStatus === 'executing'}
                        id='datePrice'
                        type='number'
                        className='pl-8'
                        placeholder='0.00'
                        value={datePrice}
                        onChange={(e) => {
                          setDatePrice(parseFloat(e.target.value));
                        }}
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='dateAvailable'
                      checked={dateAvailable}
                      onCheckedChange={(checked) => {
                        setDateAvailable(checked);
                      }}
                    />
                    <Label htmlFor='dateAvailable'>Available</Label>
                  </div>

                  <Button
                    disabled={editInventoryStatus === 'executing'}
                    className='flex items-center space-x-2 gap-2'
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!date || !datePrice) {
                        return;
                      }

                      await executeEditInventory({
                        listingId: listingData.id,
                        inventory: [
                          {
                            date: date,
                            price: datePrice,
                            isBooked: !dateAvailable,
                          },
                        ],
                      });
                      refreshInventory();
                    }}
                  >
                    {editInventoryStatus === 'executing' ? (
                      <>
                        <Loader2 className='animate-spin' />
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon />
                        Update Date
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='details'>
          <Card className='box-shadow-none border-none'>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Edit your listing information</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateListingForm listing={listingData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='bookings'>
          <Card className='box-shadow-none border-none'>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>View current and past bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>001</TableCell>
                    <TableCell>2024-09-15</TableCell>
                    <TableCell>2024-09-20</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>$500</TableCell>
                    <TableCell>Upcoming</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>002</TableCell>
                    <TableCell>2024-08-01</TableCell>
                    <TableCell>2024-08-05</TableCell>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>$400</TableCell>
                    <TableCell>Completed</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
