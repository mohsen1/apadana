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

function BookingRequestSent({ bookingRequest }: { bookingRequest: FullBookingRequest }) {
  const locale = getLocale();

  return (
    <main className='container mx-auto grid max-w-6xl flex-grow grid-cols-1 place-content-center gap-8 p-4 lg:grid-cols-2'>
      <div>
        <div className='mt-8 flex items-center'>
          <CheckCircle2 className='text-primary h-20 w-20' strokeWidth={1.5} />
        </div>
        <h1 className='text-primary mb-4 mt-8 flex items-center text-2xl font-bold'>
          Your booking request has been sent
        </h1>
        <p className='text-muted-foreground mb-4'>
          Your booking request has been sent to {bookingRequest.listing.owner.firstName}. Your host
          will review your request and get back to you soon.
        </p>
        <p className='text-muted-foreground'>
          Check-in date:{' '}
          <span className='text-primary font-bold'>
            {bookingRequest.checkIn.toLocaleDateString(getLocale(), {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            {formatHHMMDate(bookingRequest.checkIn.toLocaleTimeString(locale))}
          </span>
        </p>
        <p className='text-muted-foreground'>
          Check-out date:{' '}
          <span className='text-primary font-bold'>
            {bookingRequest.checkOut.toLocaleDateString(getLocale(), {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            {formatHHMMDate(bookingRequest.listing.checkOutTime)}
          </span>
        </p>
        <p className='text-muted-foreground'>
          Total price:{' '}
          <span className='text-primary font-bold'>
            {formatCurrency(bookingRequest.totalPrice, bookingRequest.listing.currency)}
          </span>
        </p>
        <p className='text-muted-foreground my-4'>
          A confirmation email will be sent to you and your host.
        </p>
        <h2 className='text-primary my-2 text-lg font-bold'>What happens next?</h2>
        <p>
          You will be notified when the host has accepted or rejected your request. We will send you
          an email to{' '}
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
              <h3 className='text-md font-heading text-primary mb-2 font-bold'>
                {bookingRequest.listing.title}
              </h3>
            </Link>
          </div>
          <div>
            <Link href={`/listing/${bookingRequest.listing.id}`}>
              <Image
                src={bookingRequest.listing.images?.[0]?.url ?? ''}
                alt={bookingRequest.listing.title}
                className='h-auto w-full rounded-md'
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
