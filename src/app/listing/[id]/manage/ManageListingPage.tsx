'use client';
import { getLocalTimeZone, today as getToday } from '@internationalized/date';
import {
  Listing,
  ListingInventory,
  UploadThingImage,
  User,
} from '@prisma/client';
import { Loader2, SaveIcon } from 'lucide-react';
import Image from 'next/image';
import { useAction } from 'next-safe-action/hooks';
import React, { useState } from 'react';
import { DateValue } from 'react-aria';

import { formatCurrencySymbol, getLocale, isDateInRange } from '@/lib/utils';

import { AvailabilityManagementCalendar } from '@/components/AvailabilityManagementCalendar';
import { LabledInput } from '@/components/host-calendar/LabledInput';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { RangeValue } from '@/utils/types';

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
  const today = getToday(getLocalTimeZone());
  const [range, setRange] = useState<RangeValue<DateValue> | null>({
    start: today,
    end: today,
  });
  const [rangePrice, setRangePrice] = useState<number>(
    listingData.pricePerNight,
  );
  const [rangeAvailable, setRangeAvailable] = useState<boolean>(false);
  const { execute: executeEditInventory, status: editInventoryStatus } =
    useAction(editInventory);

  async function refreshInventory() {
    const res = await getListing({ id: listingData.id });
    if (res?.data?.listing) {
      setListingInventory(res.data.listing.inventory);
    }
  }

  function isRangeAvailable(range: RangeValue<DateValue> | null) {
    const start = range?.start?.toDate(listingData.timeZone);
    const end = range?.end?.toDate(listingData.timeZone);
    if (!start || !end) {
      return false;
    }
    const inventoryInRange = listingInventory.filter((inventory) => {
      return isDateInRange(inventory.date, { start, end });
    });
    if (inventoryInRange.length === 0) {
      return false;
    }
    return inventoryInRange.every((inventory) => {
      return !inventory.isBooked;
    });
  }

  function getRangePrice(range: RangeValue<DateValue> | null) {
    const start = range?.start?.toDate(listingData.timeZone);
    const end = range?.end?.toDate(listingData.timeZone);
    if (!start || !end) {
      return 0;
    }
    const inventoryInRange = listingInventory.filter((inventory) => {
      return isDateInRange(inventory.date, { start, end });
    });
    if (inventoryInRange.length === 0) {
      return listingData.pricePerNight;
    }
    const isAllPricesSame = inventoryInRange.every((inventory) => {
      return inventory.price === inventoryInRange[0].price;
    });
    if (isAllPricesSame) {
      return inventoryInRange[0].price;
    }
    return listingData.pricePerNight;
  }

  async function onSubmit(range: RangeValue<DateValue>) {
    if (!range || !range.start || !range.end) {
      return;
    }

    const rangeLength = range.end.compare(range.start) + 1;

    const inventory = Array.from({ length: rangeLength }, (_, index) => {
      const date = range.start.add({ days: index });
      return {
        date: date.toDate(listingData.timeZone),
        price: rangePrice,
        isBooked: !rangeAvailable,
      };
    });

    await executeEditInventory({
      listingId: listingData.id,
      inventory,
    });
    refreshInventory();
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
          <Card className='box-shadow-none border-none mt-6'>
            <CardContent>
              <div className='grid lg:grid-cols-[1fr_auto] gap-8'>
                <div className=''>
                  <AvailabilityManagementCalendar
                    value={range}
                    listing={{
                      ...listingData,
                      inventory: listingInventory,
                    }}
                    onChange={(range) => {
                      setRange(range);
                      setRangeAvailable(isRangeAvailable(range));
                      setRangePrice(getRangePrice(range));
                    }}
                  />
                </div>
                <div className='min-w-[300px] space-y-4'>
                  {range && (
                    <>
                      <div className='flex items-center space-x-2 pl-2'>
                        <Switch
                          id='dateAvailable'
                          disabled={editInventoryStatus === 'executing'}
                          checked={rangeAvailable}
                          className='scale-150'
                          onCheckedChange={(checked) => {
                            setRangeAvailable(checked);
                          }}
                        />
                        <Label className='text-lg pl-2' htmlFor='dateAvailable'>
                          Available
                        </Label>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='datePrice' className='text-lg'>
                          Set the price for{' '}
                          <div>
                            <span className='font-bold'>
                              {range?.start
                                ?.toDate(listingData.timeZone)
                                .toLocaleDateString(getLocale(), {
                                  month: 'long',
                                  day: 'numeric',
                                })}
                            </span>
                            {range?.end &&
                            range?.end.compare(range.start) > 0 ? (
                              <>
                                {' to '}
                                <span className='font-bold'>
                                  {range?.end
                                    ?.toDate(listingData.timeZone)
                                    .toLocaleDateString(getLocale(), {
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </Label>
                        <div className='relative pt-4'>
                          <LabledInput
                            label={
                              <span className='text-2xl text-right'>
                                {formatCurrencySymbol(listingData.currency)}
                              </span>
                            }
                            disabled={
                              editInventoryStatus === 'executing' ||
                              !rangeAvailable
                            }
                            id='datePrice'
                            inputMode='decimal'
                            pattern='^\d*\.?\d*$'
                            type='text'
                            step='1'
                            min='1'
                            className=' l-8 text-2xl py-8'
                            placeholder='100.00'
                            value={rangePrice}
                            onChange={(e) => {
                              setRangePrice(parseFloat(e.target.value));
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        disabled={editInventoryStatus === 'executing'}
                        className='flex items-center space-x-2 gap-2'
                        onClick={async (e) => {
                          e.preventDefault();

                          if (!range) {
                            return;
                          }
                          onSubmit(range);
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
                    </>
                  )}
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
