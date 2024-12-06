'use server';

import { Button } from '@/components/ui/button';

import { getCurrentUser } from '@/app/auth/actions';

export async function LoggedInHeaderLinks() {
  const result = await getCurrentUser();
  const user = result?.data?.user;

  if (!user) {
    null;
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
