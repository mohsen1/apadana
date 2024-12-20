import { redirect } from 'next/navigation';

export default async function ManageListingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  redirect(`/listing/${params.id}/manage/calendar`);
}
