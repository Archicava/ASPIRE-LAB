import Link from 'next/link';

import { FeatureGrid } from '@/components/feature-grid';
import { InsightHighlight } from '@/components/insight-highlight';
import { GithubLink } from '@/components/github-link';

const features = [
  {
    title: 'Clinical-grade data capture',
    description:
      'Guided forms mirror the autism cohort fields: prenatal history, developmental milestones, clinical scores, and neuro findings.',
    badge: 'Case Intake'
  },
  {
    title: 'Ratio1 decentralized inference',
    description:
      'Jobs route through Ratio1 Edge Nodes and return probabilistic classifications plus provenance metadata.',
    badge: 'Inference'
  },
  {
    title: 'Longitudinal intelligence',
    description:
      'Compare cohorts, monitor developmental trajectories, and surface comorbid patterns from historic cases.',
    badge: 'Analytics'
  }
];

export default function LandingPage() {
  return (
    <main style={{ padding: '3.5rem 0 6rem' }}>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.75rem',
          display: 'grid',
          gap: '3.25rem'
        }}
      >
        <section className="fade-in">
          <span className="pill">Ratio1 Case Inference Studio</span>
          <h1
            style={{
              margin: '1.25rem 0 1rem',
              fontSize: '3.25rem',
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: '-0.03em'
            }}
          >
            Clinical intelligence for autism cohorts — powered by decentralized AI.
          </h1>
          <p
            style={{
              maxWidth: '640px',
              fontSize: '1.125rem',
              lineHeight: 1.65,
              color: 'var(--color-text-secondary)',
              marginBottom: '2.5rem'
            }}
          >
            Securely orchestrate Ratio1 inference jobs, capture structured case data aligned with the
            Romanian ASD research cohort, and turn raw assessments into auditable, data-backed decisions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href="/login"
              style={{
                padding: '0.85rem 1.9rem',
                borderRadius: '999px',
                background:
                  'radial-gradient(circle at 10% 20%, rgba(91,108,240,1) 0%, rgba(111,133,255,1) 45%, rgba(88,151,247,1) 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 15px 30px -20px rgba(64, 77, 165, 0.65)'
              }}
            >
              Enter Workspace
            </Link>
            <Link
              href="/research/insights"
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: '999px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-card)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              Explore ASD Insights
            </Link>
            <GithubLink variant="labelled" />
          </div>
        </section>

        <section className="fade-in" style={{ display: 'grid', gap: '1.25rem' }}>
          <FeatureGrid features={features} />
          <InsightHighlight />
        </section>
      </div>
    </main>
  );
}
