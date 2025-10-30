import Link from 'next/link';

import { formatDate } from '@/lib/format';
import { CaseRecord } from '@/lib/types';

type CaseListProps = {
  title: string;
  cases: CaseRecord[];
  showActions?: boolean;
};

export function CaseList({ title, cases, showActions = true }: CaseListProps) {
  const orderedCases = [...cases].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

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
        {orderedCases.map((item) => (
          <article
            key={item.id}
            style={{
              padding: '1.2rem 1.35rem',
              borderRadius: '1rem',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.9)',
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
    </section>
  );
}
