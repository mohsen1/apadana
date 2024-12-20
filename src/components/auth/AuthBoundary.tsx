'use server';

import { ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';

import { AuthProtection, verifyAccess } from '@/lib/auth/next';

export async function AuthBoundary({
  children,
  protection,
  redirectTo,
  showAccessDenied = false,
}: {
  children: React.ReactNode;
  protection: AuthProtection;
  redirectTo?: string;
  showAccessDenied?: boolean;
}) {
  const access = await verifyAccess(protection);
  if (!access) {
    if (redirectTo) {
      redirect(redirectTo);
    }

    return showAccessDenied ? <AccessDenied /> : null;
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
      <ShieldCheck className='w-16 h-16 text-destructive' />
      <h1 className='text-2xl font-bold text-destructive'>Access Denied</h1>
      <p className='text-muted-foreground'>
        You don't have permission to access this section.
      </p>
    </div>
  );
}
