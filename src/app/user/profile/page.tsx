import { AuthBoundary } from '@/components/auth/AuthBoundary';

import { AccountProfile } from '@/app/user/AccountProfile';

export default function Page() {
  return (
    <AuthBoundary protection={{ authRequired: true }} redirectTo='/signin'>
      <AccountProfile />
    </AuthBoundary>
  );
}
