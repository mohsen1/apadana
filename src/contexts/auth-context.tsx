'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

import { ClientUser, getCurrentUser, logOut } from '@/app/auth/actions';

export type { ClientUser };

interface AuthContextValue {
  user: ClientUser | null;
  signOut: () => Promise<void>;
  fetchUser: (user?: ClientUser) => void;
  setUser: (user: ClientUser | null) => void;
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
  const [user, setUser] = useState<ClientUser | null>(initialUser);

  const fetchUser = useCallback(async () => {
    const result = await getCurrentUser();
    setUser(result?.data?.user ?? null);
  }, []);

  const signOut = useCallback(async () => {
    await logOut();
    setUser(null);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value: AuthContextValue = {
    user,
    signOut,
    fetchUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
