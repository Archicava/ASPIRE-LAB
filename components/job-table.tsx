import type { CSSProperties } from 'react';

import { formatDate, formatTimeDistance } from '@/lib/format';
import { InferenceJob } from '@/lib/types';

type JobTableProps = {
  jobs: InferenceJob[];
};

const statusColor: Record<InferenceJob['status'], string> = {
  queued: '#f59e0b',
  running: '#5b6cf0',
  succeeded: '#10b981',
  failed: '#ef4444'
};

export function JobTable({ jobs }: JobTableProps) {
  const orderedJobs = [...jobs].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.1rem'
        }}
      >
        <div>
          <p className="section-title">Inference jobs</p>
          <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.4rem', fontWeight: 600 }}>
            Active and historical jobs
          </h2>
        </div>
        <span className="pill">Ratio1 Edge Nodes</span>
      </header>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem'
          }}
        >
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
              <th style={thStyle}>Job ID</th>
              <th style={thStyle}>Case</th>
              <th style={thStyle}>Payload CID</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Edge node</th>
              <th style={thStyle}>Submitted</th>
              <th style={thStyle}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {orderedJobs.map((job) => (
              <tr key={job.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={tdStyle}>{job.id}</td>
                <td style={tdStyle}>{job.caseId}</td>
                <td style={tdStyle}>
                  {job.payloadCid ? (
                    <code style={{ fontSize: '0.8rem' }}>{job.payloadCid.slice(0, 12)}…</code>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={tdStyle}>
                  <span
                    className="pill"
                    style={{
                      backgroundColor: `${statusColor[job.status]}22`,
                      color: statusColor[job.status]
                    }}
                  >
                    {job.status}
                  </span>
                </td>
                <td style={tdStyle}>{job.edgeNode ?? '—'}</td>
                <td style={tdStyle}>{formatDate(job.submittedAt)}</td>
                <td style={tdStyle}>{formatTimeDistance(job.submittedAt, job.completedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: CSSProperties = {
  padding: '0.7rem 0.55rem',
  fontWeight: 600,
  letterSpacing: '0.01em'
};

const tdStyle: CSSProperties = {
  padding: '0.9rem 0.55rem'
};
