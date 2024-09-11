'use client';

import { CalendarDate } from '@internationalized/date';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { FullListing } from '@/lib/types';
import { areEqualDates, formatCurrency, getLocale } from '@/lib/utils';

import { LightBox } from '@/components/LightBox';
import { Calendar } from '@/components/range-calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Amenity } from '@/app/listing/[id]/Amenity';

export function ListingPage({ listingData }: { listingData: FullListing }) {
  const router = useRouter();
  const todayCalendarDate = new CalendarDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  );
  const twoDaysFromToday = todayCalendarDate.add({ days: 2 });
  const [checkIn, setCheckIn] = useState<CalendarDate>(todayCalendarDate);
  const [checkOut, setCheckOut] = useState<CalendarDate>(twoDaysFromToday);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (checkIn && checkOut) {
      const searchParams = new URLSearchParams();
      searchParams.set(
        'checkIn',
        checkIn?.toDate(listingData.timeZone).toISOString(),
      );
      searchParams.set(
        'checkOut',
        checkOut?.toDate(listingData.timeZone).toISOString(),
      );
      router.push(
        `/listing/${listingData.id}/booking/create?${searchParams.toString()}`,
      );
    } else {
      alert('Please select check-in and check-out dates');
    }
  };

  // TODO: price calculation should be done on the server with a server action
  /**
   * Calculate the total price for the stay
   * @returns the total price for the stay
   */
  function calculateTotalPrice() {
    const totalPrice =
      listingData.pricePerNight * (checkOut.compare(checkIn) + 1);
    return totalPrice;
  }

  return (
    <form
      className='min-h-screen bg-gray-100 dark:bg-gray-900'
      onSubmit={onSubmit}
    >
      {/* Cover Photo */}
      <LightBox images={listingData.images} index={0}>
        <div className='relative h-[50vh] w-full '>
          <Image
            src={listingData.images[0].url}
            alt={listingData.title}
            layout='fill'
            objectFit='cover'
            priority
          />
        </div>
      </LightBox>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Listing Details */}
          <div className='md:col-span-2'>
            <h1 className='text-4xl font-bold mb-2 text-foreground font-heading'>
              {listingData.title}
            </h1>
            <p className='text-muted-foreground mb-4'>{listingData.address}</p>
            <h2 className='text-2xl font-semibold font-subheading mb-4 dark:text-white'>
              About this place
            </h2>
            <p className='text-muted-foreground mb-6'>
              {listingData.description}
            </p>

            {/* Amenities */}
            <h2 className='text-2xl font-semibold font-subheading mb-4 dark:text-white'>
              Amenities
            </h2>
            <ul className='grid grid-cols-2 gap-2 mb-6'>
              {listingData.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className='flex items-center dark:text-gray-300'
                >
                  <Amenity name={amenity} />
                </li>
              ))}
            </ul>

            {/* Image Gallery */}
            <h2 className='text-2xl font-subheading font-semibold mb-4 dark:text-white'>
              Photo Gallery
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {listingData.images.slice(1).map((image, index) => (
                <LightBox
                  key={index}
                  images={listingData.images}
                  index={index + 1}
                >
                  <div key={index} className='relative h-48'>
                    <Image
                      src={image.url}
                      key={image.id}
                      alt={`${listingData.title} - Image ${index + 2}`}
                      layout='fill'
                      objectFit='cover'
                    />
                  </div>
                </LightBox>
              ))}
            </div>
            {/* Host Information */}
            <h2 className='text-2xl font-subheading font-semibold mb-4 text-foreground mt-8'>
              Meet your host
            </h2>
            <div className='flex items-center mt-4'>
              <Image
                src={listingData.owner.imageUrl ?? ''}
                alt={listingData.owner.firstName ?? ''}
                width={128}
                height={128}
                className='rounded-md mr-4'
              />
              <div>
                <p className='my-2 font-bold text-lg'>
                  Hosted by {listingData.owner.firstName}
                </p>
                <p className='my-2'>
                  <Check className='inline-block mr-2' />
                  {listingData.owner.firstName} has hosted more than 100 guests
                </p>
                <Button variant='outline' className='my-2'>
                  Contact {listingData.owner.firstName}
                </Button>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <Card className='bg-[#f8f8f8] dark:bg-[#1d1d1d] dark:text-white lg:sticky lg:top-2 pt-4'>
              <CardContent>
                <Calendar
                  border={false}
                  isDateUnavailable={(date) => {
                    const inventoryForDate = listingData.inventory.find(
                      (inventory) => {
                        const zonedDate = date.toDate(listingData.timeZone);
                        return areEqualDates(zonedDate, inventory.date);
                      },
                    );
                    if (!inventoryForDate) {
                      return true;
                    }
                    return !inventoryForDate.isAvailable;
                  }}
                  value={{
                    start: checkIn,
                    end: checkOut,
                  }}
                  onChange={(range) => {
                    if (range) {
                      const startDate = range.start.toDate(
                        listingData.timeZone,
                      );
                      const endDate = range.end.toDate(listingData.timeZone);
                      const startCalendarDate = new CalendarDate(
                        startDate.getFullYear(),
                        startDate.getMonth() + 1,
                        startDate.getDate(),
                      );
                      const endCalendarDate = new CalendarDate(
                        endDate.getFullYear(),
                        endDate.getMonth() + 1,
                        endDate.getDate(),
                      );
                      setCheckIn(startCalendarDate);
                      setCheckOut(endCalendarDate);
                    }
                  }}
                />
                <div className='grid grid-cols-[1fr_auto] gap-4 items-center my-4'>
                  <div>
                    <span className='text-sm font-medium pr-1'>
                      {checkIn
                        .toDate(listingData.timeZone)
                        .toLocaleDateString(getLocale(), {
                          month: 'long',
                          day: 'numeric',
                        })}
                      {' to '}
                      {checkOut
                        .toDate(listingData.timeZone)
                        .toLocaleDateString(getLocale(), {
                          month: 'long',
                          day: 'numeric',
                        })}
                    </span>
                    <div>{`${checkOut.compare(checkIn) + 1} nights`}</div>
                  </div>
                  <div className='text-xl font-bold font-lg w-full text-right'>
                    {formatCurrency(
                      calculateTotalPrice(),
                      listingData.currency,
                    )}
                  </div>
                </div>

                <Button type='submit' className='w-full mt-4'>
                  Reserve
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
