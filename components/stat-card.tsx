type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  tone?: 'up' | 'neutral' | 'down';
  caption?: string;
};

export function StatCard({ label, value, change, tone = 'neutral', caption }: StatCardProps) {
  return (
    <article
      className="card"
      style={{
        padding: '1.5rem',
        display: 'grid',
        gap: '0.65rem'
      }}
    >
      <p className="section-title">{label}</p>
      <p style={{ margin: 0, fontSize: '2.05rem', fontWeight: 700 }}>{value}</p>
      {change ? (
        <span
          className="pill"
          style={{
            background: resolveToneBackground(tone),
            color: resolveToneColor(tone),
            width: 'fit-content'
          }}
        >
          {change}
        </span>
      ) : null}
      {caption ? (
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{caption}</p>
      ) : null}
    </article>
  );
}

function resolveToneBackground(tone: StatCardProps['tone']) {
  switch (tone) {
    case 'up':
      return 'rgba(96, 165, 250, 0.2)';
    case 'down':
      return 'rgba(30, 64, 175, 0.22)';
    default:
      return 'rgba(91,108,240,0.14)';
  }
}

function resolveToneColor(tone: StatCardProps['tone']) {
  switch (tone) {
    case 'up':
      return 'var(--color-success)';
    case 'down':
      return 'var(--color-danger)';
    default:
      return 'var(--color-accent)';
  }
}
