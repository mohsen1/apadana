import { redirect } from 'next/navigation';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { getBookingRequest } from '@/app/listing/[id]/booking/action';
import CreateBookingForm from '@/app/listing/[id]/booking/create/CreateBookingForm';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function CreateBookingPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkIn: string;
    checkOut: string;
    alterBookingRequestId?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  // Get the listing
  const res = await getListing({
    id: params.id,
    include: { inventory: true, owner: true, images: true },
  });

  if (!res?.data?.listing) {
    throw new Error('Failed to get listing');
  }

  const listing = res.data.listing;
  if (!listing) {
    return <NotFound title='Listing not found' />;
  }

  // Handle alteration case
  let originalBookingRequest = null;
  if (searchParams.alterBookingRequestId) {
    const bookingRequestRes = await getBookingRequest({
      id: searchParams.alterBookingRequestId,
    });
    const bookingRequest = bookingRequestRes?.data;

    if (!bookingRequest) {
      return <NotFound title='Booking request not found' />;
    }
    originalBookingRequest = bookingRequest;
  }

  const today = new Date();
  const twoDaysFromNow = new Date(today.setDate(today.getDate() + 2));
  const { checkIn, checkOut } = searchParams;

  // Use original booking dates if altering and no dates provided
  let checkInDate = checkIn ? new Date(checkIn) : originalBookingRequest?.checkIn || today;
  let checkOutDate = checkOut
    ? new Date(checkOut)
    : originalBookingRequest?.checkOut || twoDaysFromNow;

  // Validate dates
  if (isNaN(checkInDate.getTime()) || checkInDate < today) {
    checkInDate = today;
  }

  if (isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 2);
  }

  // Format dates for URL
  const formattedCheckIn = checkInDate.toISOString().split('T')[0];
  const formattedCheckOut = checkOutDate.toISOString().split('T')[0];

  // Redirect if dates were changed
  if (formattedCheckIn !== checkIn || formattedCheckOut !== checkOut) {
    const searchParams = new URLSearchParams({
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
    });

    if (originalBookingRequest) {
      searchParams.set('alterBookingRequestId', originalBookingRequest.id.toString());
    }

    return redirect(`/listing/${params.id}/booking/create?${searchParams.toString()}`);
  }

  return (
    <div className='bg-background text-foreground min-h-screen'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='md:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-foreground'>Booking Request</CardTitle>
                <CardDescription>
                  <p className='text-muted-foreground'>
                    Fill out the form below to request a booking
                  </p>
                </CardDescription>
              </CardHeader>
              <CreateBookingForm
                listing={listing}
                checkIn={new Date(checkIn)}
                checkOut={new Date(checkOut)}
                originalBookingRequest={originalBookingRequest}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
