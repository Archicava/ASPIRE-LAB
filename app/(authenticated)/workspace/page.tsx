import { CaseList } from "@/components/case-list";
import { JobTable } from "@/components/job-table";
import { StatCard } from "@/components/stat-card";
import { InsightHighlight } from "@/components/insight-highlight";
import { PlatformStatusCard } from "@/components/platform-status-card";
import {
  loadCaseRecords,
  loadInferenceJobs,
  loadPlatformStatus,
} from "@/lib/data-platform";
import { Hero } from "@/components/hero";

// Force dynamic rendering (don't statically generate at build time)
export const dynamic = 'force-dynamic';

export default async function WorkspacePage() {
  const [cases, jobs, status] = await Promise.all([
    loadCaseRecords(),
    loadInferenceJobs(),
    loadPlatformStatus(),
  ]);

  const activeCases = cases.length;
  const eegPositiveRate = activeCases
    ? Math.round(
        (cases.filter((item) => item.assessments.eegAnomalies).length /
          activeCases) *
          100
      )
    : 0;
  const medianDiagnosticAge = calculateMedian(
    cases.map((item) => item.demographics.diagnosticAgeMonths)
  );
  const minimallyVerbal = activeCases
    ? Math.round(
        (cases.filter((item) => item.behaviors.languageLevel === "Absent")
          .length /
          activeCases) *
          100
      )
    : 0;

  return (
    <main className="page-shell">
      <Hero title="Workspace" />
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <StatCard
          label="Active cohort cases"
          value={`${activeCases}`}
          change="Live CStore cohort"
          tone="up"
          caption={
            "Curated submissions synced from Ratio1 namespace ASD-RO-01."
          }
        />
        <StatCard
          label="EEG anomaly prevalence"
          value={`${eegPositiveRate}%`}
          caption={
            "Derived from submitted EEG anomaly flags in the live cohort."
          }
        />
        <StatCard
          label="Median diagnostic age"
          value={`${medianDiagnosticAge} months`}
          caption={
            "Median diagnosis age across submitted live cases."
          }
        />
        <StatCard
          label="Minimally verbal cohort"
          value={`${minimallyVerbal}%`}
          change="Live baseline"
          tone="neutral"
          caption={
            "Use communication profiles to tailor AAC recommendations."
          }
        />
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}
      >
        <div
          className="card"
          style={{ padding: "clamp(1.2rem, 4vw, 1.5rem)", display: "grid", gap: "1rem" }}
        >
          <header>
            <p className="section-title">Protocol overview</p>
            <h2
              style={{
                margin: "0.35rem 0 0",
                fontSize: "clamp(1.2rem, 3.4vw, 1.4rem)",
                fontWeight: 600,
              }}
            >
              End-to-end Ratio1 flow
            </h2>
          </header>
          <ol
            style={{
              margin: 0,
              paddingLeft: "1.2rem",
              display: "grid",
              gap: "0.6rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <li>
              Authenticate via dAuth to mint a session capability token tied to
              the ASD namespace.
            </li>
            <li>
              Capture structured case data across demographics, assessments, and
              behavior domains.
            </li>
            <li>
              Dispatch inference job to a vetted Ratio1 Edge Node with encrypted
              payload stored in R1FS.
            </li>
            <li>
              Receive multinomial classification with probabilistic narrative
              and recommended interventions.
            </li>
            <li>
              Persist job proofs and artefacts to CStore for longitudinal
              analytics and audit.
            </li>
          </ol>
        </div>
        <InsightHighlight />
      </section>

      <JobTable jobs={jobs} />
      <PlatformStatusCard status={status} />
      <CaseList
        title="Recent submissions"
        cases={cases}
        enablePagination
        pageSize={6}
      />
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
