import { getListing } from '@/app/listing/action';
import NotFound from '@/app/not-found';

export default async function BookingPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await getListing({ id: Number(params.id) });

  if (!res?.data?.success) {
    throw new Error(res?.data?.error);
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
