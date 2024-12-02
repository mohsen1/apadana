import { getUserFromSession } from '@/lib/auth';

import { SignOutForm } from '@/components/SignOutForm';

export async function UserSettings() {
  const user = await getUserFromSession();

  return (
    <div className='container mx-auto max-w-3xl py-8'>
      <div className='flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm'>
        <h1 className='text-2xl font-bold'>User Settings</h1>
        <div className='text-lg'>
          Hello {user?.firstName} {user?.lastName}
        </div>
        <SignOutForm />
      </div>
    </div>
  );
}
