import { BookingManagementLayout } from '@/app/listing/[id]/manage/BookingManagementLayout';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

import { HostCalendar } from './HostCalendar';

export default async function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
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
    <BookingManagementLayout id={id} tab='calendar'>
      <HostCalendar listingData={res.data.listing} />
    </BookingManagementLayout>
  );
}
