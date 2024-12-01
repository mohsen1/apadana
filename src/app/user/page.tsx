'use client';

import { useAuth } from '@/hooks/use-auth';

export default function Page() {
  const { user } = useAuth();

  return (
    <div>
      Hello {user?.firstName} {user?.lastName}
    </div>
  );
}
