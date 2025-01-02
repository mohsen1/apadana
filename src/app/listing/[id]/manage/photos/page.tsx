import { BookingManagementLayout } from '@/app/listing/[id]/manage/BookingManagementLayout';
import { EditPhotos } from '@/app/listing/[id]/manage/photos/EditPhotos';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
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
    <BookingManagementLayout id={id} tab='photos'>
      <EditPhotos listing={res.data.listing} />
    </BookingManagementLayout>
  );
}
