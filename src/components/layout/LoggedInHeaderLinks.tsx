import { Button } from '@/components/ui/button';

export function LoggedInHeaderLinks() {
  return (
    <>
      <Button variant='link' href='/listing/create' className='text-sm font-medium hover:underline'>
        Create Listing
      </Button>
      <Button variant='link' href='/listing' className='text-sm font-medium hover:underline'>
        My Listings
      </Button>
    </>
  );
}
