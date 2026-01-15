import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProbabilityBars } from '@/components/probability-bars';
import { loadCaseRecord, loadInferenceJob } from '@/lib/data-platform';
import { formatDate } from '@/lib/format';
import { Hero } from '@/components/hero';

// Force dynamic rendering (don't statically generate at build time)
export const dynamic = 'force-dynamic';

type CaseDetailPageProps = {
  params: { id: string };
};

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const record = await loadCaseRecord(params.id);
  if (!record) {
    notFound();
  }

  const job = record.jobId ? await loadInferenceJob(record.jobId) : undefined;

  return (
    <main className="page-shell">
      <Hero title="Case Detail" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/cases" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
          ← Back to cases
        </Link>
        <Link
          href={`/predict?caseId=${record.id}`}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--color-border)',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--color-accent)'
          }}
        >
          Open predictive lab →
        </Link>
      </div>
      <header
        className="card"
        style={{ padding: 'clamp(1.4rem, 4.5vw, 1.8rem)', display: 'grid', gap: '0.6rem' }}
      >
        <span className="pill">{record.demographics.subtype}</span>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 1.9rem)' }}>{record.demographics.caseLabel}</h1>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
          Submitted {formatDate(record.submittedAt)} · {record.demographics.ageMonths} months ·{' '}
          {record.demographics.sex}
        </p>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-secondary)' }}>{record.notes}</p>
      </header>

      {job ? (
        <section
          className="card"
          style={{ padding: 'clamp(1.35rem, 4vw, 1.7rem)', display: 'grid', gap: '1rem' }}
        >
          <header>
            <p className="section-title">Inference job</p>
            <h2 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.15rem, 3.4vw, 1.3rem)', fontWeight: 600 }}>
              Ratio1 execution details
            </h2>
          </header>
          <dl
            style={{
              margin: 0,
              display: 'grid',
              gap: '0.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
            }}
          >
            <div>
              <dt style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Job ID
              </dt>
              <dd style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{job.id}</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Status
              </dt>
              <dd style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{job.status}</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Payload CID
              </dt>
              <dd style={{ margin: '0.2rem 0 0', fontWeight: 600, overflowWrap: 'anywhere' }}>
                {job.payloadCid ? <code style={{ wordBreak: 'break-all' }}>{job.payloadCid}</code> : '—'}
              </dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Submitted
              </dt>
              <dd style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{formatDate(job.submittedAt)}</dd>
            </div>
            {job.edgeNode ? (
              <div>
                <dt style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                  Edge node
                </dt>
                <dd style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{job.edgeNode}</dd>
              </div>
            ) : null}
          </dl>
          {job.statusHistory && job.statusHistory.length ? (
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '1rem',
                display: 'grid',
                gap: '0.5rem'
              }}
            >
              <p className="section-title" style={{ fontSize: '0.75rem' }}>
                Status history
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.4rem' }}>
                {job.statusHistory.map((entry) => (
                  <li key={`${entry.status}-${entry.timestamp}`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{entry.status}</strong> · {formatDate(entry.timestamp)}
                    {entry.message ? ` – ${entry.message}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="grid-two" style={{ alignItems: 'start' }}>
        <article
          className="card"
          style={{ padding: 'clamp(1.35rem, 4vw, 1.7rem)', display: 'grid', gap: '1rem' }}
        >
          <header>
            <p className="section-title">Inference outcome</p>
            <h2 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.2rem, 3.4vw, 1.4rem)', fontWeight: 600 }}>
              {record.inference.topPrediction}
            </h2>
          </header>
          <ProbabilityBars categories={record.inference.categories} />
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {record.inference.explanation}
          </p>
        </article>
        <article
          className="card"
          style={{ padding: 'clamp(1.35rem, 4vw, 1.7rem)', display: 'grid', gap: '0.75rem' }}
        >
          <p className="section-title">Recommended next steps</p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem' }}>
            {record.inference.recommendedActions.map((action) => (
              <li key={action} style={{ lineHeight: 1.55 }}>
                {action}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section
        className="card"
        style={{ padding: 'clamp(1.35rem, 4vw, 1.7rem)', display: 'grid', gap: '1.4rem' }}
      >
        <header>
          <p className="section-title">Clinical profile</p>
          <h2 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.15rem, 3.3vw, 1.35rem)', fontWeight: 600 }}>
            Data shared with Ratio1 Edge Node
          </h2>
        </header>
        <div className="grid-two">
          <DataList
            title="Demographics"
            items={[
              ['Prenatal factors', record.demographics.prenatalFactors.join(', ')],
              ['Diagnostic age', `${record.demographics.diagnosticAgeMonths} months`],
              [
                'Parental age',
                `Mother ${record.demographics.parentalAge.mother}, Father ${record.demographics.parentalAge.father}`
              ]
            ]}
          />
          <DataList
            title="Development & behavior"
            items={[
              ['Delays', record.development.delays.join(', ')],
              ['Dysmorphic features', record.development.dysmorphicFeatures ? 'Yes' : 'No'],
              ['Regression', record.development.regressionObserved ? 'Yes' : 'No'],
              ['Comorbidities', record.development.comorbidities.join(', ') || '—'],
              ['Behavioral concerns', record.behaviors.concerns.join(', ')],
              ['Language level', record.behaviors.languageLevel],
              ['Sensory notes', record.behaviors.sensoryNotes]
            ]}
          />
          <DataList
            title="Assessments"
            items={[
              ['ADOS score', record.assessments.adosScore.toString()],
              ['ADI-R score', record.assessments.adirScore.toString()],
              ['EEG anomalies', record.assessments.eegAnomalies ? 'Detected' : 'None'],
              ['MRI findings', record.assessments.mriFindings ?? '—'],
              ['Head circumference', `${record.assessments.headCircumference} cm`]
            ]}
          />
        </div>
      </section>
    </main>
  );
}

function DataList({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div
      style={{
        padding: 'clamp(0.95rem, 3.5vw, 1.1rem)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        display: 'grid',
        gap: '0.6rem',
        background: 'linear-gradient(135deg, rgba(220, 233, 255, 0.82), rgba(240, 246, 255, 0.95))'
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
      <dl style={{ margin: 0, display: 'grid', gap: '0.4rem' }}>
        {items.map(([label, value]) => (
          <div key={label} className="data-item">
            <dt style={{ color: 'var(--color-text-secondary)' }}>{label}</dt>
            <dd className="data-value">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
