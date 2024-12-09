import { ListingPage } from '@/app/listing/[id]/ListingPage';
import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const res = await getListing({ id: parseInt(params?.id, 10) });

  if (!res?.data?.listing) {
    throw new Error('Failed to get listing');
  }

  const listing = res?.data?.listing;

  if (!listing) {
    return (
      <NotFound
        title='Listing Not Found'
        message='The listing you are looking for does not exist.'
      />
    );
  }

  return <ListingPage listingData={listing} />;
}
