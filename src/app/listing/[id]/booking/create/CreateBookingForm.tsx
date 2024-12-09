'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInDays, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';

import {
  CreateBookingRequest,
  CreateBookingRequestSchema,
} from '@/lib/prisma/schema';
import { PublicListing } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

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

import { createBookingRequest } from '@/app/listing/[id]/booking/action';
import { ImageGallery } from '@/app/listing/[id]/booking/create/ImageGallery';

export default function BookingPage({
  listing,
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
}: {
  listing: PublicListing;
  checkIn: Date;
  checkOut: Date;
}) {
  const router = useRouter();
  const { register, handleSubmit, getValues, formState } =
    useForm<CreateBookingRequest>({
      defaultValues: {
        listingId: listing.id,
        checkIn: initialCheckIn,
        checkOut: initialCheckOut,
        guests: 1,
        message: '',
        pets: false,
      },
      resolver: zodResolver(CreateBookingRequestSchema),
    });

  const { execute, status, result } = useAction(createBookingRequest, {
    onSuccess: (res) => {
      if (res?.data?.id) {
        router.push(`/listing/${listing.id}/booking/request/${res.data?.id}`);
      }
    },
  });

  const onSubmit = async (data: CreateBookingRequest) => {
    execute({
      listingId: listing.id,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      message: data.message,
      pets: false,
    });
  };

  const checkin = getValues('checkIn');
  const checkout = getValues('checkOut');
  const basePrice = listing.pricePerNight;
  const nights = differenceInDays(
    toZonedTime(checkout, listing.timeZone),
    toZonedTime(checkin, listing.timeZone),
  );
  const subtotal = basePrice * 1;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  return (
    <div className='container mx-auto p-4 flex-grow max-w-6xl grid grid-cols-[1fr_auto]'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Image Gallery Column */}
        <ImageGallery listing={listing} />
        {/* Booking Form Column */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 lg:w-1/2'>
          <Card className=''>
            <CardHeader>
              <CardTitle>Book your stay</CardTitle>
              <CardDescription>
                Select your dates and enter your details to book this listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Selected dates</label>
                <div>
                  From{' '}
                  <span className='font-semibold'>
                    {format(checkin, 'MMM d, yyyy')}
                  </span>{' '}
                  to{' '}
                  <span className='font-semibold'>
                    {format(checkout, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2 pt-4'>
                  <label htmlFor='guests' className='text-sm font-medium'>
                    Number of guests
                  </label>
                  <Select
                    {...register('guests')}
                    defaultValue={formState.defaultValues?.guests?.toString()}
                  >
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
              </div>

              <div className='space-y-2 py-4'>
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
                  {...register('message')}
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
            <CardFooter className='flex flex-col gap-2'>
              <Button type='submit' className='w-full'>
                {status === 'executing'
                  ? 'Sending...'
                  : 'Send your booking request'}
              </Button>
              {result.serverError ? (
                <div className='text-red-500 w-full'>
                  {result.serverError.error}
                </div>
              ) : null}
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
