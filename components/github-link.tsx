'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

const githubUrl = 'https://github.com/Ratio1/ASPIRE';

export function GithubLink({ variant = 'compact' }: { variant?: 'compact' | 'labelled' }) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: variant === 'labelled' ? '0.5rem' : '0.4rem',
    padding: variant === 'labelled' ? '0.5rem 0.85rem' : '0.45rem',
    borderRadius: '999px',
    border: '1px solid var(--color-border)',
    background: isHovered
      ? 'linear-gradient(135deg, rgba(29, 78, 216, 0.18), rgba(37, 99, 235, 0.25))'
      : 'var(--color-card)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'transform 150ms ease, box-shadow 150ms ease, background 150ms ease',
    boxShadow: isHovered ? '0 12px 28px -22px rgba(15, 35, 95, 0.65)' : 'none'
  };

  const iconWrapperStyles: CSSProperties = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.85), rgba(96, 165, 250, 0.95))',
    color: 'white',
    boxShadow: '0 6px 14px -8px rgba(15, 35, 95, 0.6)'
  };

  return (
    <Link
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={baseStyles}
      aria-label="Open ASPIRE GitHub repository"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={iconWrapperStyles}>
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.43 7.87 10.97.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.69-1.3-1.69-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.39.97.1-.75.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.27 1.19-3.07-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.17a11.16 11.16 0 0 1 5.8 0c2.2-1.48 3.17-1.17 3.17-1.17.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.07 0 4.41-2.68 5.39-5.24 5.67.42.36.8 1.09.8 2.19 0 1.58-.02 2.85-.02 3.24 0 .31.21.67.8.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
      </span>
      {variant === 'labelled' ? <span>View on GitHub</span> : null}
    </Link>
  );
}
