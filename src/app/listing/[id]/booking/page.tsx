import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function BookingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const res = await getListing({ id: params.id });

  if (!res?.data?.listing) {
    throw new Error('Failed to get listing');
  }

  const listing = res?.data?.listing;

  if (!listing) {
    return <NotFound />;
  }
  return (
    <div>
      <pre>{JSON.stringify(listing, null, 2)}</pre>
    </div>
  );
}
