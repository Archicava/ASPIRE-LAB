'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type User = {
  id: string;
  username: string;
  displayName: string;
  role: string;
};

type AuthContextValue = {
  user: User | null;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'ratio1-auth';
const DEMO_USERNAME = process.env.NEXT_PUBLIC_RATIO1_DEMO_USERNAME || 'demo';
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_RATIO1_DEMO_PASSWORD || 'demo';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = useCallback(async ({ username, password }: { username: string; password: string }) => {
    if (username.trim() !== DEMO_USERNAME || password.trim() !== DEMO_PASSWORD) {
      throw new Error('Invalid credentials');
    }

    const nextUser: User = {
      id: `user_${crypto.randomUUID()}`,
      username: DEMO_USERNAME,
      displayName: 'Demo Clinician',
      role: 'operator'
    };

    setUser(nextUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

