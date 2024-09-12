import { FullBookingRequest } from '@/lib/types';

import { getBookingRequest } from '@/app/listing/[id]/booking/action';
import NotFound from '@/app/not-found';

export default async function BookingRequestPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await getBookingRequest({
    id: Number(params.id),
  });

  if (!res?.data?.success) {
    throw new Error(res?.data?.error || 'Failed to get booking request');
  }

  if (!res?.data?.data) {
    return <NotFound title='Booking request not found' />;
  }

  return <BookingRequestSent bookingRequest={res.data.data} />;
}

function BookingRequestSent({
  bookingRequest,
}: {
  bookingRequest: FullBookingRequest;
}) {
  return (
    <main className='flex-grow'>
      <h1 className='text-2xl font-bold'>Request sent</h1>
      <p>
        Your booking request has been sent to{' '}
        {bookingRequest.listing.owner.firstName}. Your host will review your
        request and get back to you soon.
      </p>
      <p>
        You will be notified when the host has accepted or rejected your
        request. We will send you an email to {bookingRequest.user.email} when
        the host has accepted or rejected your request.
      </p>
    </main>
  );
}
