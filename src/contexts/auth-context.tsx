'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

import { ClientUser, getCurrentUser, logOut } from '@/app/auth/actions';
import { createLogger } from '@/utils/logger';

export type { ClientUser };

interface AuthContextValue {
  /** Current user */
  user: ClientUser | null;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Fetch the current user. This will cause a re-render of the entire app. */
  fetchUser: () => void;
  /** Set the current user */
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: ClientUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const logger = createLogger('AuthProvider');
  const [user, setUser] = useState<ClientUser | null>(initialUser ?? null);

  const fetchUser = useCallback(async () => {
    const result = await getCurrentUser();
    setUser(result?.data?.user ?? null);
  }, [getCurrentUser]);

  const signOut = useCallback(async () => {
    try {
      const result = await logOut();
      if (result?.data?.user === null) {
        setUser(null);
      } else {
        throw new Error('Failed to log out');
      }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
