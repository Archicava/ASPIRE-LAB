'use client';

import { type CSSProperties, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth-context';
import { useToast } from '@/components/toast';

const DEMO_USERNAME = process.env.NEXT_PUBLIC_RATIO1_DEMO_USERNAME || 'demo';
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_RATIO1_DEMO_PASSWORD || 'demo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) {
      toast.show({ title: 'Please complete all fields', tone: 'danger' });
      return;
    }

    setLoading(true);
    try {
      await login({ username, password });
      toast.show({
        title: 'Authenticated via Ratio1 dAuth',
        description: 'Session token stored locally for this prototype.',
        tone: 'success'
      });
      router.push('/workspace');
    } catch (error) {
      toast.show({
        title: 'Invalid credentials',
        description: 'Use the demo/demo credentials or contact an administrator.',
        tone: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem, 4vw, 2rem)'
      }}
    >
      <form
        className="card fade-in"
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: 'clamp(1.6rem, 5vw, 2.35rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1.1rem, 4vw, 1.5rem)'
        }}
      >
        <header>
          <span className="pill">dAuth Wallet Login</span>
          <h1
            style={{
              margin: '1.1rem 0 0.65rem',
              fontSize: 'clamp(1.6rem, 4.5vw, 1.85rem)'
            }}
          >
            Unlock your Ratio1 workspace
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Use your clinical operator identity to submit cases, launch inference jobs, and review your
            decentralized audit trail.
          </p>
        </header>
        <div
          style={{
            padding: 'clamp(0.65rem, 3vw, 0.75rem) clamp(0.85rem, 3.5vw, 1rem)',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-border)',
            background: 'rgba(91,108,240,0.08)',
            color: 'var(--color-text-secondary)',
            fontSize: 'clamp(0.85rem, 2.8vw, 0.9rem)'
          }}
        >
          Demo credentials: <strong>{DEMO_USERNAME}</strong> / <strong>{DEMO_PASSWORD}</strong>
        </div>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600 }}>Operator username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="demo"
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600 }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••"
            style={inputStyle}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.85rem 1.75rem',
            borderRadius: '999px',
            background: 'var(--color-accent)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Authenticating…' : 'Sign in with dAuth'}
        </button>
      </form>
    </main>
  );
}

const inputStyle: CSSProperties = {
  padding: '0.85rem 1rem',
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  backgroundColor: 'rgba(232, 241, 255, 0.92)',
  transition: 'border-color 120ms ease'
};
