'use server';

import { getUserFromSession } from '@/lib/auth';

import { Button } from '@/components/ui/button';

export async function LoggedInHeaderLinks() {
  const user = await getUserFromSession();

  if (!user) {
    return null;
  }

  return (
    <Button href='/listing' variant='link'>
      My Listings
    </Button>
  );
}
