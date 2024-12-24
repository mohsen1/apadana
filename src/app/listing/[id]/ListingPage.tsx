'use client';

import { CalendarDate } from '@internationalized/date';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { FullListing } from '@/lib/types';
import { areAllDatesAvailable, formatCurrency, getLocale, isDateUnavailable } from '@/lib/utils';

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
  const isRangeAvailable = areAllDatesAvailable(
    { start: checkIn, end: checkOut },
    listingData.inventory,
    listingData.timeZone,
  );
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (checkIn && checkOut) {
      const searchParams = new URLSearchParams();
      searchParams.set('checkIn', checkIn?.toDate(listingData.timeZone).toISOString());
      searchParams.set('checkOut', checkOut?.toDate(listingData.timeZone).toISOString());
      router.push(`/listing/${listingData.id}/booking/create?${searchParams.toString()}`);
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
    const totalPrice = listingData.pricePerNight * (checkOut.compare(checkIn) + 1);
    return totalPrice;
  }

  return (
    <form className='bg-background min-h-screen' onSubmit={onSubmit}>
      {/* Cover Photo */}
      <LightBox images={listingData.images} index={0}>
        <div className='relative h-[50vh] w-full'>
          <Image
            src={listingData.images[0].url}
            alt={listingData.title}
            width={800}
            height={400}
            objectFit='cover'
            priority
          />
        </div>
      </LightBox>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {/* Listing Details */}
          <div className='md:col-span-2'>
            <h1 className='font-heading mb-2 text-4xl font-bold'>{listingData.title}</h1>
            <p className='text-muted-foreground mb-4'>{listingData.address}</p>
            <h2 className='font-subheading text-foreground mb-4 text-2xl font-semibold'>
              About this place
            </h2>
            <p className='text-muted-foreground mb-6'>{listingData.description}</p>

            {/* Amenities */}
            <h2 className='font-subheading text-foreground mb-4 text-2xl font-semibold'>
              Amenities
            </h2>
            <ul className='mb-6 grid grid-cols-2 gap-2'>
              {listingData.amenities.map((amenity) => (
                <li key={amenity} className='text-muted-foreground flex items-center'>
                  <Amenity name={amenity} />
                </li>
              ))}
            </ul>

            {/* Image Gallery */}
            <h2 className='font-subheading text-foreground mb-4 text-2xl font-semibold'>
              Photo Gallery
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {listingData.images.slice(1).map((image, index) => (
                <LightBox key={index} images={listingData.images} index={index + 1}>
                  <div key={index} className='relative h-48'>
                    <Image
                      unoptimized
                      src={image.url}
                      key={image.id}
                      width={128}
                      height={128}
                      alt={`${listingData.title} - Image ${index + 2}`}
                      objectFit='cover'
                    />
                  </div>
                </LightBox>
              ))}
            </div>
            {/* Host Information */}
            <h2 className='font-subheading mb-4 mt-8 text-2xl font-semibold'>Meet your host</h2>
            <div className='mt-4 flex items-center'>
              <Image
                src={listingData.owner.imageUrl ?? ''}
                alt={listingData.owner.firstName ?? ''}
                width={128}
                height={128}
                className='mr-4 rounded-md'
                loader={({ src }) => {
                  return src;
                }}
              />
              <div>
                <p className='my-2 text-lg font-bold'>Hosted by {listingData.owner.firstName}</p>
                <p className='my-2'>
                  <Check className='mr-2 inline-block' />
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
            <Card className='bg-card text-card-foreground pt-4 lg:sticky lg:top-2'>
              <CardContent>
                <Calendar
                  border={false}
                  isDateUnavailable={(date) =>
                    isDateUnavailable(date, listingData.inventory, listingData.timeZone)
                  }
                  value={{
                    start: checkIn,
                    end: checkOut,
                  }}
                  onChange={(range) => {
                    if (range) {
                      const startDate = range.start.toDate(listingData.timeZone);
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
                <div className='my-4 grid grid-cols-[1fr_auto] items-center gap-4'>
                  <div>
                    <span className='pr-1 text-sm font-medium' suppressHydrationWarning>
                      {checkIn.toDate(listingData.timeZone).toLocaleDateString(getLocale(), {
                        month: 'long',
                        day: 'numeric',
                      })}
                      {' to '}
                      {checkOut.toDate(listingData.timeZone).toLocaleDateString(getLocale(), {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <div>{`${checkOut.compare(checkIn) + 1} nights`}</div>
                  </div>
                  <div className='font-lg w-full text-right text-xl font-bold'>
                    {isRangeAvailable
                      ? formatCurrency(calculateTotalPrice(), listingData.currency)
                      : '–'}
                  </div>
                </div>

                <Button
                  type='submit'
                  className='mt-4 w-full'
                  disabled={!checkIn || !checkOut || !isRangeAvailable}
                >
                  {isRangeAvailable ? 'Reserve' : 'Unavailable'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
