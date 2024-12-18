'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

import { ClientUser } from '@/app/auth/actions';
import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

export type { ClientUser };

interface AuthContextValue {
  user: ClientUser | null;
  signOut: () => Promise<void>;
  fetchUser: () => void;
  setUser: (user: ClientUser | null) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: ClientUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const logger = createLogger('AuthProvider');
  const [user, setUser] = useState<ClientUser | null>(initialUser ?? null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/user');
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = (await res.json()) as { user: ClientUser | null };
      setUser(data.user);
    } catch (error) {
      assertError(error);
      logger.error('Error fetching user in AuthProvider:', error);
      setUser(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to log out');
      setUser(null);
    } catch (error) {
      logger.error('Error logging out in AuthProvider:', error);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const value: AuthContextValue = {
    user,
    signOut,
    fetchUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
