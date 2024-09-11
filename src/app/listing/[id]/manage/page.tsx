import { redirect } from 'next/navigation';

export default function ManageListingPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/listing/${params.id}/manage/calendar`);
}
