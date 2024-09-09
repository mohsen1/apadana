'use client';

import { CalendarDate } from '@internationalized/date';
import { Listing, UploadThingImage, User } from '@prisma/client';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { formatCurrency } from '@/lib/utils';

import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function BookingPage({
  listing,
}: {
  listing: Listing & { images: UploadThingImage[] } & { owner: User };
  checkIn: Date;
  checkOut: Date;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    new Date(searchParams.get('checkin') || Date.now()),
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    new Date(searchParams.get('checkout') || Date.now()),
  );
  const [guests, setGuests] = useState('1');
  const [pets, setPets] = useState('0');
  const [message, setMessage] = useState('');
  const [mainImage, setMainImage] = useState(0);

  const handleDateSelect = (
    dates: {
      start: CalendarDate;
      end: CalendarDate;
    } | null,
  ) => {
    if (!dates) return;
    const timeZone =
      listing.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    setCheckIn(dates.start.toDate(timeZone));
    setCheckOut(dates.end.toDate(timeZone));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    searchParams.set('checkin', checkIn?.toISOString() ?? '');
    searchParams.set('checkout', checkOut?.toISOString() ?? '');
    searchParams.set('guests', guests);
    searchParams.set('pets', pets);
    searchParams.set('message', message);

    router.push(
      `/listing/${listing.id}/booking/payment?${searchParams.toString()}`,
    );
  };

  const basePrice = listing.pricePerNight;
  const nights =
    checkOut && checkIn
      ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
      : 0;
  const subtotal = basePrice * nights;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  return (
    <div className='container mx-auto p-4 flex-grow max-w-6xl grid grid-cols-[1fr_auto]'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Image Gallery Column */}
        <div className='lg:w-3/4'>
          <div className='relative aspect-video mb-4'>
            <Image
              src={listing.images[0].url}
              alt={`Listing image ${listing.images[0].name}`}
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
                <Image
                  src={img.url}
                  alt={img.name ?? ''}
                  fill
                  className='object-cover rounded-md'
                />
              </button>
            ))}
          </div>
          <h2 className='text-2xl pt-6 pb-2 font-bold'>{listing.title}</h2>
          <div className=''>{listing.description}</div>
        </div>

        {/* Booking Form Column */}
        <form onSubmit={handleSubmit} className='space-y-6 lg:w-1/2'>
          <Card className=''>
            <CardHeader>
              <CardTitle>Book your stay</CardTitle>
              <CardDescription>
                Select your dates and enter your details to book this listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Select dates</label>
                {checkIn && checkOut && (
                  <DatePicker
                    selected={{
                      start: new CalendarDate(
                        checkIn.getFullYear(),
                        checkIn.getMonth() + 1,
                        checkIn.getDate(),
                      ),
                      end: new CalendarDate(
                        checkOut.getFullYear(),
                        checkOut.getMonth() + 1,
                        checkOut.getDate(),
                      ),
                    }}
                    onSelect={handleDateSelect}
                  />
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label htmlFor='guests' className='text-sm font-medium'>
                    Number of guests
                  </label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger id='guests'>
                      <SelectValue placeholder='Select guests' />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} guest{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='pets' className='text-sm font-medium'>
                    Number of pets
                  </label>
                  <Select value={pets} onValueChange={setPets}>
                    <SelectTrigger id='pets'>
                      <SelectValue placeholder='Select pets' />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} pet{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='grid grid-cols-[auto_1fr] items-center py-2'>
                  <Image
                    src={listing.owner.imageUrl ?? ''}
                    alt={listing.owner.firstName ?? ''}
                    width={32}
                    height={32}
                    className='rounded-full mr-4'
                  />
                  <div>Hosted by {listing.owner.firstName}</div>
                </div>
                <label htmlFor='message' className='text-sm font-medium'>
                  Message to host
                </label>
                <Textarea
                  id='message'
                  placeholder='Enter any special requests or questions for the host'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>Price breakdown</h3>
                <div className='space-y-1'>
                  <div className='flex justify-between'>
                    <span>
                      {formatCurrency(basePrice, listing.currency)} x {nights}{' '}
                      nights
                    </span>
                    <span>${subtotal}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Service fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between font-semibold'>
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type='submit' className='w-full'>
                Proceed to Payment
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
