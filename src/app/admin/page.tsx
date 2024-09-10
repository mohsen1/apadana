import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div className='flex-grow max-w-screen-lg mx-auto w-full'>
      <section className='border-b border-gray-200 pb-8'>
        <h1 className='text-2xl font-bold my-4'>Admin</h1>
        <h2 className='text-xl font-bold my-4'>Storybook</h2>
        <Button href='http://localhost:6006'> Go to Storybook </Button>
      </section>
    </div>
  );
}
