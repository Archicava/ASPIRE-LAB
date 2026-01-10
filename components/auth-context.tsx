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
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_STORAGE_KEY = 'aspire-session';

type StoredSession = { user: User; token: string };

function readSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch (_error) {
    return null;
  }
}

function persistSession(session: StoredSession | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (_error) {
    // Ignore persistence errors in constrained environments.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = readSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ username, password }: { username: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        const message = typeof data?.error === 'string' ? data.error : 'Unable to authenticate';
        throw new Error(message);
      }

      const userData = data.user as { username: string; role?: string; metadata?: Record<string, unknown> };
      const metadata = userData.metadata ?? {};
      const displayName =
        typeof metadata.displayName === 'string'
          ? metadata.displayName
          : typeof metadata.fullName === 'string'
            ? metadata.fullName
            : userData.username;

      const nextUser = {
        username: userData.username,
        role: userData.role,
        displayName,
        metadata
      };
      const nextToken = typeof data.token === 'string' ? data.token : 'local-session';

      setUser(nextUser);
      setToken(nextToken);
      persistSession({ user: nextUser, token: nextToken });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to authenticate';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      persistSession(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, error, login, logout }),
    [user, token, loading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
