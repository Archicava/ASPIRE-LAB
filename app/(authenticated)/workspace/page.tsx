import { CaseList } from '@/components/case-list';
import { JobTable } from '@/components/job-table';
import { StatCard } from '@/components/stat-card';
import { InsightHighlight } from '@/components/insight-highlight';
import { PlatformStatusCard } from '@/components/platform-status-card';
import { loadCaseRecords, loadInferenceJobs, loadPlatformStatus } from '@/lib/data-platform';
import { platformConfig } from '@/lib/config';
import { getCohortStats } from '@/lib/cohort-data';

export default async function WorkspacePage() {
  const [cases, jobs, status] = await Promise.all([
    loadCaseRecords(),
    loadInferenceJobs(),
    loadPlatformStatus()
  ]);

  const cohortStats = platformConfig.useMocks ? getCohortStats() : null;

  const activeCases = cohortStats ? cohortStats.totalCases : cases.length;
  const eegPositiveRate = cohortStats
    ? cohortStats.eegAnomalyRate
    : activeCases
    ? Math.round(
        (cases.filter((item) => item.assessments.eegAnomalies).length / activeCases) * 100
      )
    : 0;
  const medianDiagnosticAge = cohortStats?.diagnosisAge.median ?? calculateMedian(
    cases.map((item) => item.demographics.diagnosticAgeMonths)
  );
  const minimallyVerbalBaseline = cohortStats
    ? Math.round((cohortStats.language.absent / cohortStats.totalCases) * 100)
    : 26;
  const minimallyVerbal = cohortStats
    ? minimallyVerbalBaseline
    : activeCases
    ? Math.round(
        (cases.filter((item) => item.behaviors.languageLevel === 'Absent').length / activeCases) *
          100
      )
    : 0;

  return (
    <main
      style={{
        display: 'grid',
        gap: '1.75rem',
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '0 1.5rem'
      }}
    >
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.1rem'
        }}
      >
        <StatCard
          label="Active cohort cases"
          value={`${activeCases}`}
          change={cohortStats ? 'ASD cohort dataset' : '+3 new this quarter'}
          tone="up"
          caption={
            cohortStats
              ? 'Full Romanian ASD cohort imported from baza de date pacienți.'
              : 'Curated submissions synced from Ratio1 namespace ASD-RO-01.'
          }
        />
        <StatCard
          label="EEG anomaly prevalence"
          value={`${eegPositiveRate}%`}
          caption={
            cohortStats
              ? 'Derived directly from EEG metrics in the ASD cohort spreadsheet.'
              : 'Aligns with 2x uplift over general pediatric baseline reported in cohort literature.'
          }
        />
        <StatCard
          label="Median diagnostic age"
          value={`${medianDiagnosticAge} months`}
          caption={
            cohortStats
              ? 'Median diagnosis age computed across all 315 cohort records.'
              : 'Group 1 early detection cluster maintained via milestone tracking.'
          }
        />
        <StatCard
          label="Minimally verbal cohort"
          value={`${minimallyVerbal}%`}
          change={cohortStats ? 'Dataset baseline' : '26% in source dataset'}
          tone="neutral"
          caption={
            cohortStats
              ? 'Language profile benchmarked from the Romanian cohort dataset.'
              : 'Use communication profiles to tailor AAC recommendations.'
          }
        />
      </section>

      <section className="grid-two" style={{ alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <header>
            <p className="section-title">Protocol overview</p>
            <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.4rem', fontWeight: 600 }}>
              End-to-end Ratio1 flow
            </h2>
          </header>
          <ol
            style={{
              margin: 0,
              paddingLeft: '1.2rem',
              display: 'grid',
              gap: '0.6rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            <li>
              Authenticate via dAuth to mint a session capability token tied to the ASD namespace.
            </li>
            <li>Capture structured case data across demographics, assessments, and behavior domains.</li>
            <li>Dispatch inference job to a vetted Ratio1 Edge Node with encrypted payload stored in R1FS.</li>
            <li>
              Receive multinomial classification with probabilistic narrative and recommended interventions.
            </li>
            <li>Persist job proofs and artefacts to CStore for longitudinal analytics and audit.</li>
          </ol>
        </div>
        <InsightHighlight />
      </section>

      <JobTable jobs={jobs} />
      <PlatformStatusCard status={status} />
      <CaseList title="Recent submissions" cases={cases} />
    </main>
  );
}

function calculateMedian(values: number[]) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}
