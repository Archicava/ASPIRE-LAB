import { formatProbability } from '@/lib/format';
import { InferenceCategory } from '@/lib/types';

type ProbabilityBarsProps = {
  categories: InferenceCategory[];
};

export function ProbabilityBars({ categories }: ProbabilityBarsProps) {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {categories.map((category) => (
        <div key={category.label} style={{ display: 'grid', gap: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 600 }}>{category.label}</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {formatProbability(category.probability)}
            </span>
          </div>
          <div
            style={{
              height: '10px',
              borderRadius: '999px',
              background: 'rgba(91,108,240,0.12)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.round(category.probability * 100)}%`,
                height: '100%',
                borderRadius: '999px',
                background:
                  'linear-gradient(90deg, rgba(91,108,240,1) 0%, rgba(88,151,247,1) 100%)'
              }}
            />
          </div>
          {category.narrative ? (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {category.narrative}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

