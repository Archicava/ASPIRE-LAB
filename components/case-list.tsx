"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { formatDate } from '@/lib/format';
import { CaseRecord } from '@/lib/types';

type CaseListProps = {
  title: string;
  cases: CaseRecord[];
  showActions?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
};

export function CaseList({
  title,
  cases,
  showActions = true,
  enablePagination = false,
  pageSize = 6
}: CaseListProps) {
  const orderedCases = useMemo(
    () =>
      [...cases].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
    [cases]
  );

  const [page, setPage] = useState(1);
  const totalPages = enablePagination
    ? Math.max(1, Math.ceil(orderedCases.length / pageSize))
    : 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = enablePagination ? (currentPage - 1) * pageSize : 0;
  const endIndex = enablePagination ? startIndex + pageSize : orderedCases.length;
  const displayedCases = orderedCases.slice(startIndex, endIndex);

  return (
    <section className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1.1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="section-title">Case library</p>
          <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.35rem', fontWeight: 600 }}>{title}</h2>
        </div>
        {showActions ? (
          <Link
            href="/cases/new"
            className="pill"
            style={{
              background: 'var(--color-accent)',
              color: 'white'
            }}
          >
            New submission
          </Link>
        ) : null}
      </header>
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        {displayedCases.map((item) => (
          <article
            key={item.id}
            style={{
              padding: '1.2rem 1.35rem',
              borderRadius: '1rem',
              border: '1px solid var(--color-border)',
              background: 'linear-gradient(135deg, rgba(220, 233, 255, 0.82), rgba(240, 246, 255, 0.95))',
              display: 'grid',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  className="pill"
                  style={{
                    background: 'rgba(91,108,240,0.1)',
                    color: 'var(--color-accent)'
                  }}
                >
                  {item.demographics.subtype}
                </span>
                <strong>{item.demographics.caseLabel}</strong>
              </div>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                {formatDate(item.submittedAt)}
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{item.notes}</p>
            {showActions ? (
              <Link
                href={`/cases/${item.id}`}
                style={{ fontWeight: 600, color: 'var(--color-accent)', fontSize: '0.95rem' }}
              >
                Review inference →
              </Link>
            ) : null}
          </article>
        ))}
      </div>
      {enablePagination && orderedCases.length > pageSize ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.2rem'
          }}
        >
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Showing {startIndex + 1}–{Math.min(endIndex, orderedCases.length)} of {orderedCases.length}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="pill"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                opacity: currentPage === 1 ? 0.6 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Prev
            </button>
            <span style={{ alignSelf: 'center', color: 'var(--color-text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="pill"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                opacity: currentPage === totalPages ? 0.6 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
