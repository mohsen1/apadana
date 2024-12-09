import { Bookings } from '@/app/listing/[id]/manage/Bookings';
import { BookingRequests } from '@/app/listing/[id]/manage/BookingsRequests';
import { EditPhotos } from '@/app/listing/[id]/manage/EditPhotos';
import { HostCalendar } from '@/app/listing/[id]/manage/HostCalendar';
import UpdateListingForm from '@/app/listing/[id]/manage/UpdateListingForm';
import { WelcomeToNewListing } from '@/app/listing/[id]/manage/WelcomeToNewListing';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function ManageListingPage(props: {
  params: Promise<{
    id: string;
    tab: string;
  }>;
  searchParams: Promise<{
    newListing?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const res = await getListing({
    id: Number.parseInt(params.id, 10),
    include: {
      owner: true,
      images: true,
      inventory: true,
    },
  });
  if (!res?.data?.listing) {
    throw new Error('Failed to get listing');
  }
  const listing = res.data.listing;

  if (!listing) {
    return <NotFound />;
  }

  switch (params.tab) {
    default:
    case 'calendar':
      return (
        <>
          {searchParams.newListing && <WelcomeToNewListing />}
          <HostCalendar listingData={listing} />
        </>
      );
    case 'details':
      return <UpdateListingForm listing={listing} />;
    case 'photos':
      return <EditPhotos listing={listing} />;
    case 'bookings':
      return <Bookings listingId={listing.id} />;
    case 'booking-requests':
      return <BookingRequests listing={listing} />;
  }
}
