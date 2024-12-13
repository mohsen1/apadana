import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { FullBookingRequest } from '@/lib/types';
import { formatCurrency, formatHHMMDate, getLocale } from '@/lib/utils';

import { getBookingRequest } from '@/app/listing/[id]/booking/action';
import NotFound from '@/app/not-found';

export default async function BookingRequestPage(props: {
  params: Promise<{ id: string; bookingRequestId: string }>;
}) {
  const params = await props.params;
  const res = await getBookingRequest({
    id: params.bookingRequestId,
  });

  if (!res?.data?.updatedAt) {
    throw new Error('Failed to get booking request');
  }

  if (!res?.data?.updatedAt) {
    return <NotFound title='Booking request not found' />;
  }

  return <BookingRequestSent bookingRequest={res.data} />;
}

function BookingRequestSent({
  bookingRequest,
}: {
  bookingRequest: FullBookingRequest;
}) {
  return (
    <main className='flex-grow container mx-auto p-4 max-w-6xl grid grid-cols-1  lg:grid-cols-2 gap-8'>
      <div>
        <div className='flex items-center mt-8'>
          <CheckCircle2
            className='w-20 h-20 text-green-500'
            strokeWidth={1.5}
          />
        </div>
        <h1 className='text-2xl mt-8 font-bold mb-4 flex items-center'>
          Your booking request has been sent
        </h1>
        <p className='mb-4'>
          Your booking request has been sent to{' '}
          {bookingRequest.listing.owner.firstName}. Your host will review your
          request and get back to you soon.
        </p>
        <p>
          Check-in date:{' '}
          <span className='font-bold'>
            {bookingRequest.checkIn.toLocaleDateString(getLocale(), {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            {formatHHMMDate(bookingRequest.listing.checkInTime)}
          </span>
        </p>
        <p>
          Check-out date:{' '}
          <span className='font-bold'>
            {bookingRequest.checkOut.toLocaleDateString(getLocale(), {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            {formatHHMMDate(bookingRequest.listing.checkOutTime)}
          </span>
        </p>
        <p>
          Total price:{' '}
          <span className='font-bold'>
            {formatCurrency(
              bookingRequest.totalPrice,
              bookingRequest.listing.currency,
            )}
          </span>
        </p>
        <p className='my-4'>
          A confirmation email will be sent to you and your host.
        </p>
        <h2 className='text-lg font-bold my-2'>What happens next?</h2>
        <p>
          You will be notified when the host has accepted or rejected your
          request. We will send you an email to{' '}
          <span className='font-bold'>
            {bookingRequest.user?.emailAddresses?.[0]?.emailAddress}
          </span>{' '}
          when the host has accepted or rejected your request.
        </p>
      </div>
      <div>
        <div>
          <div>
            <Link href={`/listing/${bookingRequest.listing.id}`}>
              <h3 className='text-md font-bold font-heading mb-2'>
                {bookingRequest.listing.title}
              </h3>
            </Link>
          </div>
          <div>
            <Link href={`/listing/${bookingRequest.listing.id}`}>
              <Image
                src={bookingRequest.listing.images?.[0]?.url ?? ''}
                alt={bookingRequest.listing.title}
                className='w-full h-auto rounded-md'
                width={400}
                height={300}
              />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
