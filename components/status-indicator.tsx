'use client';

import { useState } from 'react';

import { useStatus } from '@/lib/contexts/status-context';
import { StatusModal } from '@/components/status-modal';

export function StatusIndicator() {
  const { r1fsStatus, cstoreStatus, isLoading } = useStatus();
  const [modalOpen, setModalOpen] = useState(false);

  const r1fsTone = resolveTone(r1fsStatus);
  const cstoreTone = resolveTone(cstoreStatus);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          border: '1px solid var(--color-border)',
          background: 'white',
          padding: '0.45rem 0.75rem',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          {isLoading ? 'Checking…' : 'Edge status'}
        </span>
        <Badge tone={cstoreTone} label="CStore" />
        <Badge tone={r1fsTone} label="R1FS" />
      </button>
      <StatusModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function Badge({
  tone,
  label
}: {
  tone: { label: string; background: string; color: string };
  label: string;
}) {
  return (
    <span
      className="pill"
      style={{
        background: tone.background,
        color: tone.color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: tone.color
        }}
      />
      {label}
    </span>
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
      label: 'Warn',
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

