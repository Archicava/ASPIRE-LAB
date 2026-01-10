'use client';

import { type CSSProperties, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth-context';
import { useToast } from '@/components/toast';
import { Hero } from '@/components/hero';

type AdminUser = {
  username: string;
  role?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
};

type UsersResponse = {
  mode: 'mock';
  users: AdminUser[];
};

type UserCreatedResponse = {
  mode: 'mock';
  user: AdminUser;
};

type ErrorResponse = {
  error: string;
  mode?: 'live';
};

function getErrorMessage(data: UsersResponse | UserCreatedResponse | ErrorResponse | null): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if ('error' in data && typeof data.error === 'string') {
    return data.error;
  }

  return null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'mock' | 'live' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('operator');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/workspace');
    }
  }, [user, router]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      const data = (await response.json().catch(() => null)) as UsersResponse | ErrorResponse | null;

      if (!response.ok || !data) {
        const message = getErrorMessage(data) ?? 'Failed to load users.';
        setError(message);
        if (data && 'mode' in data && data.mode === 'live') {
          setMode('live');
        }
        return;
      }

      if ('mode' in data && data.mode === 'mock') {
        setMode('mock');
        setUsers(data.users ?? []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    void loadUsers();
  }, [user, loadUsers]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!username.trim() || !password.trim()) {
        toast.show({ title: 'Provide username and password', tone: 'danger' });
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
            role: role.trim(),
            displayName: displayName.trim() || undefined
          })
        });

        const data = (await response.json().catch(() => null)) as UserCreatedResponse | ErrorResponse | null;

        if (!response.ok || !data) {
          const message = getErrorMessage(data) ?? 'Failed to create user.';
          toast.show({ title: message, tone: 'danger' });
          setError(message);
          if (data && 'mode' in data && data.mode === 'live') {
            setMode('live');
          }
          return;
        }

        if ('mode' in data && data.mode === 'mock') {
          setMode('mock');
          setUsers((prev) => [data.user, ...prev]);
        }

        setUsername('');
        setPassword('');
        setDisplayName('');
        setRole('operator');
        toast.show({ title: 'User created', tone: 'success' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create user.';
        toast.show({ title: message, tone: 'danger' });
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [username, password, displayName, role, toast]
  );

  const isAdmin = user?.role === 'admin';
  const displayMode = mode ?? (loading ? null : 'mock');
  const resolvedError = error ?? (displayMode === 'live' ? 'User management is disabled in live mode.' : null);
  const usersLabel = useMemo(() => `${users.length} user${users.length === 1 ? '' : 's'}`, [users.length]);

  if (!user) {
    return null;
  }

  return (
    <main className="page-shell">
      <Hero
        title="Admin console"
        subtitle="Manage mock users for the Ratio1 Case Inference Studio prototype."
      />
      <section
        className="card"
        style={{
          padding: 'clamp(1.35rem, 4vw, 1.7rem)',
          display: 'grid',
          gap: '1.1rem'
        }}
      >
        <header style={{ display: 'grid', gap: '0.35rem' }}>
          <span className="pill">User provisioning</span>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3.5vw, 1.4rem)' }}>Create a new operator</h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            This panel writes to the in-memory mock auth store. In live mode, use the Ratio1 admin
            tooling instead.
          </p>
        </header>
        {resolvedError ? (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.9rem',
              background: 'rgba(220, 38, 38, 0.08)',
              color: 'var(--color-danger)'
            }}
          >
            {resolvedError}
          </div>
        ) : null}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: '1rem',
            opacity: displayMode === 'live' || !isAdmin ? 0.6 : 1,
            pointerEvents: displayMode === 'live' || !isAdmin ? 'none' : 'auto'
          }}
        >
          <div className="grid-two form-grid">
            <label className="form-field">
              <span style={{ fontWeight: 600 }}>Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="operator-01"
                style={inputStyle}
              />
            </label>
            <label className="form-field">
              <span style={{ fontWeight: 600 }}>Display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Clinical Operator"
                style={inputStyle}
              />
            </label>
          </div>
          <div className="grid-two form-grid">
            <label className="form-field">
              <span style={{ fontWeight: 600 }}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </label>
            <label className="form-field">
              <span style={{ fontWeight: 600 }}>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)} style={inputStyle}>
                <option value="operator">Operator</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting || displayMode === 'live' || !isAdmin}
            style={{
              alignSelf: 'flex-start',
              padding: '0.75rem 1.6rem',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--color-accent)',
              color: 'white',
              fontWeight: 600,
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Creating…' : 'Create user'}
          </button>
        </form>
      </section>

      <section
        className="card"
        style={{
          padding: 'clamp(1.35rem, 4vw, 1.7rem)',
          display: 'grid',
          gap: '1.2rem'
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <span className="pill">Directory</span>
            <h2 style={{ margin: '0.6rem 0 0', fontSize: 'clamp(1.2rem, 3.5vw, 1.4rem)' }}>
              Mock user roster
            </h2>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{usersLabel}</span>
        </header>
        {loading ? (
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Loading users…</p>
        ) : users.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            No mock users found. Create one to get started.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {users.map((entry) => {
              const name = resolveDisplayName(entry);
              return (
                <div
                  key={entry.username}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '0.9rem',
                    border: '1px solid var(--color-border)',
                    background: 'rgba(255, 255, 255, 0.7)',
                    display: 'grid',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{name}</strong>
                    <span className="pill">{entry.role || 'user'}</span>
                  </div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{entry.username}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function resolveDisplayName(user: AdminUser): string {
  const metadata = user.metadata ?? {};
  const displayName =
    typeof metadata.displayName === 'string'
      ? metadata.displayName
      : typeof metadata.fullName === 'string'
        ? metadata.fullName
        : user.username;

  return displayName || user.username;
}

const inputStyle: CSSProperties = {
  padding: '0.8rem 1rem',
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  backgroundColor: 'rgba(232, 241, 255, 0.92)',
  transition: 'border-color 120ms ease'
};
