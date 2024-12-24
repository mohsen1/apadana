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
    <div className='bg-accent relative flex h-full flex-col items-center justify-center rounded-md p-4'>
      <X
        className='absolute right-2 top-2 hover:cursor-pointer hover:rounded-full hover:bg-gray-200'
        onClick={handleClose}
      />
      <h1 className='text-2xl font-semibold'>Welcome to your new listing!</h1>
      <p className='text-sm'>
        You can now start adding your listing details and setting up your availability and pricing.
      </p>
    </div>
  );
}
