'use client';

import { User } from '@prisma/client';
import { createContext, useEffect, useState } from 'react';

import { getCurrentUser, logOut } from '@/app/auth/actions';
import logger from '@/utils/logger';

interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await getCurrentUser();

        if (!response.success) {
          setUser(null);
          return;
        }

        setUser(response.user);
      } catch (error) {
        logger.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoaded(true);
      }
    }

    loadUser();
  }, []);

  const signOut = async () => {
    try {
      await logOut();
      setUser(null);
    } catch (error) {
      logger.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  };

  const value: AuthContextValue = {
    isLoaded,
    isSignedIn: !!user,
    user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
