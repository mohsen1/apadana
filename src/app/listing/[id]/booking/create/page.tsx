import { redirect } from 'next/navigation';

import CreateBookingForm from '@/app/listing/[id]/booking/create/CreateBookingForm';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function CreateBookingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { checkIn: string; checkOut: string };
}) {
  const res = await getListing({
    id: Number(params.id),
    include: { inventory: true, owner: true, images: true },
  });
  if (!res?.data?.success) {
    throw res?.data?.error || new Error('Failed to get listing');
  }
  const listing = res.data.listing;
  if (!listing) {
    return <NotFound title='Listing not found' />;
  }
  const today = new Date();
  const twoDaysFromNow = new Date(today.setDate(today.getDate() + 2));
  const { checkIn, checkOut } = searchParams;

  let checkInDate = checkIn ? new Date(checkIn) : today;
  let checkOutDate = checkOut ? new Date(checkOut) : twoDaysFromNow;

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
    return redirect(
      `/listing/${params.id}/booking/create?checkIn=${formattedCheckIn}&checkOut=${formattedCheckOut}`,
    );
  }

  return (
    <CreateBookingForm
      listing={listing}
      checkIn={new Date(checkIn)}
      checkOut={new Date(checkOut)}
    />
  );
}
