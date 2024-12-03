'use server';

import { getUserInServer } from '@/lib/auth';

import { Button } from '@/components/ui/button';

export async function LoggedInHeaderLinks() {
  const user = await getUserInServer();

  if (!user) {
    return null;
  }

  return (
    <>
      <Button href='/listing/create' variant='link'>
        Create Listing
      </Button>
      <Button href='/listing' variant='link'>
        My Listings
      </Button>
    </>
  );
}
