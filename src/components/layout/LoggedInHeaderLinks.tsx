import { Button } from '@/components/ui/button';

export function LoggedInHeaderLinks() {
  return (
    <>
      <Button
        variant='link'
        href='/listing/create'
        className='text-sm font-medium text-muted-foreground hover:text-foreground'
      >
        Create Listing
      </Button>
      <Button
        variant='link'
        href='/listing'
        className='text-sm font-medium text-muted-foreground hover:text-foreground'
      >
        My Listings
      </Button>
    </>
  );
}
