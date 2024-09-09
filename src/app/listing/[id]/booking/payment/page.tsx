export default function PaymentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: {
    checkin: string;
    checkout: string;
    guests: string;
    pets: string;
    message: string;
  };
}) {
  return (
    <div className='container mx-auto flex-grow max-w-6xl'>
      <pre>{JSON.stringify(searchParams, null, 2)}</pre>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}
