'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/components/auth-context';
import { StatusIndicator } from '@/components/status-indicator';

const navLinks = [
  { href: '/workspace', label: 'Workspace' },
  { href: '/cases/new', label: 'New Case' },
  { href: '/predict', label: 'Predictive Lab' },
  { href: '/cases', label: 'Case Library' },
  { href: '/research/insights', label: 'Research' }
];

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        background: 'transparent'
      }}
    >
      <nav
        className="card"
        style={{
          margin: '1.75rem auto 1rem',
          padding: '1.1rem 1.5rem',
          width: 'min(1040px, 92vw)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/workspace" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, rgba(91,108,240,1) 0%, rgba(177,191,255,1) 100%)',
                display: 'grid',
                placeItems: 'center',
                color: 'white',
                fontWeight: 700
              }}
            >
              R1
            </div>
            <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>Inference Studio</span>
          </Link>
          <div
            style={{
              width: '1px',
              alignSelf: 'stretch',
              background: 'var(--color-border)'
            }}
          />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.55rem 0.9rem',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    background: isActive ? 'var(--color-accent)' : 'transparent',
                    transition: 'background 150ms ease, color 150ms ease'
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <StatusIndicator />
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{user.displayName}</p>
            <p
              style={{
                margin: '0.15rem 0 0',
                color: 'var(--color-text-secondary)',
                fontSize: '0.8rem'
              }}
            >
              {user.username}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-card)',
              padding: '0.55rem 1.1rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Log out
          </button>
        </div>
      </nav>
      <div style={{ paddingBottom: '4rem' }}>{children}</div>
    </div>
  );
}
