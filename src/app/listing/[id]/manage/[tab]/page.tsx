import { getListing } from '@/app/listing/[id]/manage/action';
import { Bookings } from '@/app/listing/[id]/manage/Bookings';
import { HostCalendar } from '@/app/listing/[id]/manage/HostCalendar';
import UpdateListingForm from '@/app/listing/[id]/manage/UpdateListingForm';
import NotFound from '@/app/not-found';

export default async function ManageListingPage({
  params,
}: {
  params: {
    id: string;
    tab: string;
  };
}) {
  const res = await getListing({ id: Number.parseInt(params.id, 10) });
  const listing = res?.data?.listing;

  if (!listing) {
    return <NotFound />;
  }

  switch (params.tab) {
    default:
    case 'calendar':
      return <HostCalendar listingData={listing} />;
    case 'bookings':
      return <Bookings />;
    case 'details':
      return <UpdateListingForm listing={listing} />;
  }
}
