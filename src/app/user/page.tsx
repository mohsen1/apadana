import { useAuth } from '@/hooks/use-auth';

export function Page() {
  const { user } = useAuth();

  return <div>{user?.firstName}</div>;
}
