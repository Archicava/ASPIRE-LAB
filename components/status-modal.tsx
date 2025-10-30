'use client';

import { useStatus } from '@/lib/contexts/status-context';

type StatusModalProps = {
  open: boolean;
  onClose: () => void;
};

export function StatusModal({ open, onClose }: StatusModalProps) {
  const { r1fsStatus, cstoreStatus, isLoading, error, refresh } = useStatus();

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: 'min(640px, 92vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '1.8rem',
          display: 'grid',
          gap: '1.25rem',
          position: 'relative'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="section-title">Ratio1 Edge Node telemetry</p>
            <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.4rem', fontWeight: 600 }}>
              Live service diagnostics
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => refresh().catch(() => undefined)}
              style={{
                border: '1px solid var(--color-border)',
                background: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                background: 'var(--color-accent)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </header>

        {error ? (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.75rem',
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--color-danger)',
              fontWeight: 600
            }}
          >
            {error}
          </div>
        ) : null}

        <StatusPanel title="CStore" status={cstoreStatus} />
        <StatusPanel title="R1FS" status={r1fsStatus} />
      </div>
    </div>
  );
}

function StatusPanel({ title, status }: { title: string; status: Record<string, unknown> | null }) {
  const tone = resolveTone(status);

  return (
    <section
      style={{
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.1rem',
        display: 'grid',
        gap: '0.6rem',
        background: 'rgba(255,255,255,0.92)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span
          className="pill"
          style={{
            background: tone.background,
            color: tone.color
          }}
        >
          {tone.label}
        </span>
      </div>
      <pre
        style={{
          margin: 0,
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '0.9rem 1rem',
          borderRadius: '0.75rem',
          fontSize: '0.8rem',
          overflowX: 'auto'
        }}
      >
        {JSON.stringify(status ?? { message: 'No data received' }, null, 2)}
      </pre>
    </section>
  );
}

function resolveTone(status: Record<string, unknown> | null) {
  if (!status) {
    return {
      label: 'Unknown',
      background: 'rgba(148, 163, 184, 0.18)',
      color: '#475569'
    };
  }

  const statusValue = String((status as any).status ?? '').toLowerCase();
  if (statusValue.includes('error') || statusValue.includes('fail')) {
    return {
      label: 'Error',
      background: 'rgba(239, 68, 68, 0.15)',
      color: 'var(--color-danger)'
    };
  }
  if (statusValue.includes('warn') || statusValue.includes('degraded')) {
    return {
      label: 'Degraded',
      background: 'rgba(245, 158, 11, 0.18)',
      color: 'var(--color-warning)'
    };
  }
  return {
    label: 'Healthy',
    background: 'rgba(16, 185, 129, 0.18)',
    color: 'var(--color-success)'
  };
}

