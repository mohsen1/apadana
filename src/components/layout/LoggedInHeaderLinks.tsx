'use server';

import { getUserInServer } from '@/lib/auth';

import { Button } from '@/components/ui/button';

export async function LoggedInHeaderLinks() {
  const user = await getUserInServer();

  const createListing = (
    <Button href='/listing/create' variant='link'>
      Create Listing
    </Button>
  );

  if (!user) {
    return createListing;
  }

  return (
    <>
      {createListing}
      <Button href='/listing' variant='link'>
        My Listings
      </Button>
    </>
  );
}
