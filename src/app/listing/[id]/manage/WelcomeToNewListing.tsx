'use client';

import { X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export function WelcomeToNewListing() {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!searchParams.get('newListing')) {
    return null;
  }

  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('newListing');
    router.replace(`${location.pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className='flex flex-col items-center justify-center h-full bg-green-100 dark:bg-green-900 p-4 rounded-md relative'>
      <X
        className='absolute top-2 right-2 hover:cursor-pointer hover:rounded-full hover:bg-gray-200'
        onClick={handleClose}
      />
      <h1 className='text-2xl font-semibold'>Welcome to your new listing!</h1>
      <p className='text-sm '>
        You can now start adding your listing details and setting up your
        availability and pricing.
      </p>
    </div>
  );
}
