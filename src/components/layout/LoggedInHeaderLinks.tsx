import { Button } from '@/components/ui/button';

export function LoggedInHeaderLinks() {
  return (
    <>
      <Button
        variant='link'
        href='/listing/create'
        className='text-muted-foreground hover:text-foreground text-sm font-medium'
      >
        Create Listing
      </Button>
      <Button
        variant='link'
        href='/listing'
        className='text-muted-foreground hover:text-foreground text-sm font-medium'
      >
        My Listings
      </Button>
    </>
  );
}
