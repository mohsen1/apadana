import { Bookings } from '@/app/listing/[id]/manage/Bookings';
import { BookingRequests } from '@/app/listing/[id]/manage/BookingsRequests';
import { HostCalendar } from '@/app/listing/[id]/manage/HostCalendar';
import UpdateListingForm from '@/app/listing/[id]/manage/UpdateListingForm';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function ManageListingPage({
  params,
}: {
  params: {
    id: string;
    tab: string;
  };
}) {
  const res = await getListing({
    id: Number.parseInt(params.id, 10),
    include: {
      bookings: true,
      owner: true,
      images: true,
      inventory: true,
    },
  });
  if (!res?.data?.success) {
    throw res?.data?.error || new Error('Failed to get listing');
  }
  const listing = res.data.listing;

  if (!listing) {
    return <NotFound />;
  }

  switch (params.tab) {
    default:
    case 'calendar':
      return <HostCalendar listingData={listing} />;
    case 'bookings':
      return <Bookings bookings={listing.bookings} />;
    case 'booking-requests':
      return <BookingRequests listing={listing} />;
    case 'details':
      return <UpdateListingForm listing={listing} />;
  }
}
