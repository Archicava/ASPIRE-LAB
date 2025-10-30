type Feature = {
  title: string;
  description: string;
  badge: string;
};

type FeatureGridProps = {
  features: Feature[];
};

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid grid-two">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="card"
          style={{
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem'
          }}
        >
          <span className="pill" style={{ width: 'fit-content' }}>
            {feature.badge}
          </span>
          <div>
            <h3
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '-0.01em'
              }}
            >
              {feature.title}
            </h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {feature.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

