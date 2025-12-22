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
        backgroundColor: 'rgba(11, 28, 61, 0.45)',
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
          padding: 'clamp(1.3rem, 4.5vw, 1.8rem)',
          display: 'grid',
          gap: '1.25rem',
          position: 'relative'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="status-modal-header">
          <div>
            <p className="section-title">Ratio1 Edge Node telemetry</p>
            <h2 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.2rem, 3.5vw, 1.4rem)', fontWeight: 600 }}>
              Live service diagnostics
            </h2>
          </div>
          <div className="status-modal-actions">
            <button
              type="button"
              onClick={() => refresh().catch(() => undefined)}
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-card)',
                color: 'var(--color-accent)',
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
              background: 'rgba(30, 64, 175, 0.2)',
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
        background: 'linear-gradient(135deg, rgba(219, 232, 255, 0.88), rgba(237, 244, 255, 0.95))'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem'
        }}
      >
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
          background: '#102a5c',
          color: '#e4ecff',
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
      background: 'rgba(99, 125, 199, 0.25)',
      color: '#1e3a8a'
    };
  }

  const statusValue = String((status as any).status ?? '').toLowerCase();
  if (statusValue.includes('error') || statusValue.includes('fail')) {
    return {
      label: 'Error',
      background: 'rgba(30, 64, 175, 0.25)',
      color: 'var(--color-danger)'
    };
  }
  if (statusValue.includes('warn') || statusValue.includes('degraded')) {
    return {
      label: 'Degraded',
      background: 'rgba(59, 130, 246, 0.22)',
      color: 'var(--color-warning)'
    };
  }
  return {
    label: 'Healthy',
    background: 'rgba(96, 165, 250, 0.2)',
    color: 'var(--color-success)'
  };
}
