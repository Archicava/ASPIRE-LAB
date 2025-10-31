const insights = [
  {
    metric: '26%',
    label: 'Minimally verbal or non-verbal cases',
    context: 'Language outcomes tracked from the Romanian ASD cohort.'
  },
  {
    metric: '2.1x',
    label: 'Higher EEG anomaly prevalence',
    context: 'Relative to general pediatric population; informs neurology referrals.'
  },
  {
    metric: '18 mo.',
    label: 'Median diagnostic age',
    context: 'Early detection group leveraging parental concern and milestone delays.'
  }
];

export function InsightHighlight() {
  return (
    <section
      className="card"
      style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p className="section-title">Research-grounded analytics</p>
          <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.45rem', fontWeight: 600 }}>
            Key signals from the 118-case Romanian autism study
          </h2>
        </div>
        <span
          className="pill"
          style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--color-success)'
          }}
        >
          Evidence-backed
        </span>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.1rem'
        }}
      >
        {insights.map((item) => (
          <div
            key={item.label}
            style={{
              borderRadius: '1rem',
              border: '1px dashed var(--color-border)',
              padding: '1.25rem'
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--color-accent)'
              }}
            >
              {item.metric}
            </p>
            <p style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>{item.label}</p>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              {item.context}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
