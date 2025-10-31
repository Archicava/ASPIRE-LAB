'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type User = {
  username: string;
  displayName: string;
  role?: string;
  metadata?: Record<string, unknown>;
};

type AuthContextValue = {
  user: User | null;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = (await response.json()) as {
          authenticated: boolean;
          user?: { username: string; role?: string; metadata?: Record<string, unknown> };
        };

        if (!cancelled && data.authenticated && data.user) {
          const metadata = data.user.metadata ?? {};
          const displayName =
            typeof metadata.displayName === 'string'
              ? metadata.displayName
              : typeof metadata.fullName === 'string'
                ? metadata.fullName
                : data.user.username;

          setUser({
            username: data.user.username,
            role: data.user.role,
            displayName,
            metadata
          });
        }
      } catch (error) {
        console.warn('[auth] Failed to load session', error);
        if (!cancelled) {
          setUser(null);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ username, password }: { username: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const error = typeof data?.error === 'string' ? data.error : 'Unable to authenticate';
      throw new Error(error);
    }

    const userData = data.user as { username: string; role?: string; metadata?: Record<string, unknown> };
    const metadata = userData.metadata ?? {};
    const displayName =
      typeof metadata.displayName === 'string'
        ? metadata.displayName
        : typeof metadata.fullName === 'string'
          ? metadata.fullName
          : userData.username;

    setUser({
      username: userData.username,
      role: userData.role,
      displayName,
      metadata
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setUser(null);
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
