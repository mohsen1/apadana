import { Metadata } from 'next';

import { AuthBoundary } from '@/components/auth/AuthBoundary';

import { AccountPage } from './AccountPage';

export const metadata: Metadata = {
  title: 'Use Account',
};

export default async function UserPage() {
  return (
    <AuthBoundary
      redirectTo='/sign-in?redirect=/user'
      protection={{ authRequired: true }}
    >
      <AccountPage />
    </AuthBoundary>
  );
}
