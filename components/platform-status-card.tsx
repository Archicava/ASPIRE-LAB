type PlatformStatusCardProps = {
  status: {
    cstore?: Record<string, unknown>;
    r1fs?: Record<string, unknown>;
  };
};

function formatValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !key.startsWith('_'))
      .slice(0, 4);
    return entries.map(([key, val]) => `${key}: ${String(val)}`).join(' • ');
  }
  return 'Unavailable';
}

export function PlatformStatusCard({ status }: PlatformStatusCardProps) {
  return (
    <section
      className="card"
      style={{
        padding: '1.6rem',
        display: 'grid',
        gap: '1.2rem'
      }}
    >
      <header>
        <p className="section-title">Edge node health</p>
        <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.35rem', fontWeight: 600 }}>
          CStore &amp; R1FS signals
        </h2>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.1rem'
        }}
      >
        <article
          style={{
            borderRadius: '1rem',
            border: '1px solid var(--color-border)',
            padding: '1.1rem',
            background: 'rgba(255,255,255,0.92)'
          }}
        >
          <span className="pill" style={{ background: 'rgba(91,108,240,0.12)', color: 'var(--color-accent)' }}>
            CStore
          </span>
          <p
            style={{
              margin: '0.6rem 0 0',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5
            }}
          >
            {formatValue(status.cstore)}
          </p>
        </article>
        <article
          style={{
            borderRadius: '1rem',
            border: '1px solid var(--color-border)',
            padding: '1.1rem',
            background: 'rgba(255,255,255,0.92)'
          }}
        >
          <span className="pill" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--color-accent)' }}>
            R1FS
          </span>
          <p
            style={{
              margin: '0.6rem 0 0',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5
            }}
          >
            {formatValue(status.r1fs)}
          </p>
        </article>
      </div>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        In production the values surface live signals from the Ratio1 Edge Node endpoints. In mock
        mode, synthetic values illustrate the expected structure.
      </p>
    </section>
  );
}

