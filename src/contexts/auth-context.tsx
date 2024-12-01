'use client';

import { useAction } from 'next-safe-action/hooks';
import { createContext, useCallback, useEffect, useState } from 'react';

import { ClientUser, getCurrentUser, logOut } from '@/app/auth/actions';

export type { ClientUser };

interface AuthContextValue {
  user: ClientUser | null;
  signOut: () => void;
  fetchUser: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({
  children,
  user: initialUser,
}: {
  children: React.ReactNode;
  user: ClientUser | null;
}) {
  const { execute: signOut, result: signOutResult } = useAction(logOut);
  const [user, setUser] = useState<ClientUser | null>(initialUser);

  const fetchUser = useCallback(async () => {
    const result = await getCurrentUser();
    setUser(result?.data?.user ?? null);
  }, []);

  useEffect(() => {
    if (signOutResult?.data?.success) {
      setUser(null);
    }
  }, [signOutResult?.data?.success]);

  const value: AuthContextValue = {
    user,
    signOut,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
