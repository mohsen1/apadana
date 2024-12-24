export default async function PaymentPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkin: string;
    checkout: string;
    guests: string;
    pets: string;
    message: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return (
    <div className='container mx-auto max-w-6xl flex-grow'>
      <pre className='text-muted-foreground'>{JSON.stringify(searchParams, null, 2)}</pre>
      <pre className='text-muted-foreground'>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}
