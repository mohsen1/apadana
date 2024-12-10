import { Button } from '@/components/ui/button';

export function LoggedInHeaderLinks() {
  return (
    <>
      <Button
        variant='link'
        href='/create-listing'
        className='text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
      >
        Create Listing
      </Button>
      <Button
        variant='link'
        href='/my-listings'
        className='text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
      >
        My Listings
      </Button>
    </>
  );
}
