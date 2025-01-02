import { BookingRequests } from '@/app/listing/[id]/manage/booking-requests/BookingsRequests';
import { BookingManagementLayout } from '@/app/listing/[id]/manage/BookingManagementLayout';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function BookingRequestsPage({ params }: { params: Promise<{ id: string }> }) {
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
    <BookingManagementLayout id={id} tab='booking-requests'>
      <BookingRequests listing={res.data.listing} />
    </BookingManagementLayout>
  );
}
