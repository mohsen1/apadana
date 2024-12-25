import { BookingManagementLayout } from '@/app/listing/[id]/manage/BookingManagementLayout';
import { Bookings } from '@/app/listing/[id]/manage/bookings/Bookings';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function BookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = (await params) || {};
  const res = await getListing({
    id,
    include: {
      owner: true,
      images: true,
      inventory: true,
    },
  });

  if (!res?.data?.listing) {
    return <NotFound />;
  }

  return (
    <BookingManagementLayout id={id} tab='bookings'>
      <Bookings listingId={res.data.listing.id} />
    </BookingManagementLayout>
  );
}
