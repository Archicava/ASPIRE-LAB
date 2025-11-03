'use client';

import { GithubLink } from '@/components/github-link';
import { StatusIndicator } from '@/components/status-indicator';

export function Footer() {
  return (
    <footer
      className="card"
      style={{
        margin: '1rem auto 1.75rem',
        padding: '0.9rem 1.1rem',
        width: 'min(1040px, 92vw)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} Ratio1 Inference Studio
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <StatusIndicator />
        <GithubLink />
      </div>
    </footer>
  );
}

