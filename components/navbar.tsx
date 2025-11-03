'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth-context';

const navLinks = [
  { href: '/cases/new', label: 'New Case' },
  { href: '/predict', label: 'Predictive Lab' },
  { href: '/cases', label: 'Case Library' },
  { href: '/research/insights', label: 'Research' }
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  

  if (!user) return null;

  return (
    <nav
      className="card"
      style={{
        margin: '1.75rem auto 1rem',
        padding: '1.1rem 1.5rem',
        width: 'min(1040px, 92vw)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'nowrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        <Link href="/workspace" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(91,108,240,1) 0%, rgba(177,191,255,1) 100%)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.5rem 0.85rem',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            aria-hidden="true"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(29,78,216,0.9), rgba(96,165,250,0.95))',
              color: 'white',
              fontWeight: 700,
              letterSpacing: '0.03em'
            }}
            title={user.displayName || 'Demo Clinician'}
          >
            {getInitials(user.displayName || 'Demo Clinician')}
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
            {user.displayName || 'Demo Clinician'}
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
            padding: '0.5rem 1.0rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          Log out
        </button>
      </div>
    </nav>
  );
}

function getInitials(name: string) {
  if (!name) return 'D';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return (first + second || first || 'D').toUpperCase();
}
