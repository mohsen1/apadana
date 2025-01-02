import { BookingManagementLayout } from '@/app/listing/[id]/manage/BookingManagementLayout';
import UpdateListingForm from '@/app/listing/[id]/manage/details/UpdateListingForm';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function DetailsPage({ params }: { params: Promise<{ id: string }> }) {
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
    <BookingManagementLayout id={id} tab='details'>
      <UpdateListingForm listing={res.data.listing} />
    </BookingManagementLayout>
  );
}
