'use client';

import { GithubLink } from '@/components/github-link';
import { StatusIndicator } from '@/components/status-indicator';

export function Footer() {
  return (
    <footer
      className="card footer-shell"
    >
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.85rem, 2.2vw, 0.9rem)' }}>
        © {new Date().getFullYear()} Ratio1 Inference Studio
      </div>
      <div className="footer-actions">
        <StatusIndicator />
        <GithubLink />
      </div>
    </footer>
  );
}
