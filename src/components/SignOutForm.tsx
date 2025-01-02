'use client';

import { RedirectType } from 'next/navigation';
import { redirect } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';

export function SignOutForm() {
  const { signOut } = useAuth();

  return (
    <form
      action={async () => {
        await signOut();
        redirect('/', RedirectType.push);
      }}
    >
      <Button type='submit'>Log out</Button>
    </form>
  );
}
