import { Metadata } from 'next';

import { AuthBoundary } from '@/components/auth/AuthBoundary';
import { UserSettings } from '@/components/user/UserSettings';

export const metadata: Metadata = {
  title: 'User Settings',
};

export default async function UserPage() {
  return (
    <AuthBoundary
      redirectTo='/sign-in?redirect=/user'
      protection={{ authRequired: true }}
    >
      <UserSettings />
    </AuthBoundary>
  );
}
