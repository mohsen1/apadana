'use client';

import { SignedIn } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';

export function LoggedInHeaderLinks() {
  return (
    <SignedIn>
      <Button href='/listing' variant='link'>
        My Listings
      </Button>
    </SignedIn>
  );
}
