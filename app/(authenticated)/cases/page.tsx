import { CaseList } from '@/components/case-list';
import { ProbabilityBars } from '@/components/probability-bars';
import { loadCaseRecords } from '@/lib/data-platform';
import { CaseRecord } from '@/lib/types';

export default async function CasesPage() {
  const cases = await loadCaseRecords();
  const aggregatedCategories = aggregateCategories(cases);

  return (
    <main
      style={{
        display: 'grid',
        gap: '1.5rem',
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 1.5rem 4rem'
      }}
    >
      <section
        className="card"
        style={{
          padding: '1.7rem',
          display: 'grid',
          gap: '1.2rem'
        }}
      >
        <header>
          <span className="pill">Cohort distribution</span>
          <h1 style={{ margin: '0.7rem 0 0', fontSize: '1.6rem' }}>Inference phenotype mix</h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Each case routes through a multinomial classifier; probabilities shown are averaged across the
            stored cohort. Use this view to monitor the balance between profound ASD, high-functioning,
            and syndromic presentations.
          </p>
        </header>
        <ProbabilityBars categories={aggregatedCategories} />
      </section>
      <CaseList title="All cases" cases={cases} showActions={false} />
    </main>
  );
}

function aggregateCategories(cases: CaseRecord[]) {
  const categoryMap = new Map<string, number>();
  cases.forEach((record) => {
    record.inference.categories.forEach((category) => {
      categoryMap.set(category.label, (categoryMap.get(category.label) ?? 0) + category.probability);
    });
  });
  const count = cases.length || 1;
  return Array.from(categoryMap.entries())
    .map(([label, total]) => ({
      label,
      probability: total / count
    }))
    .sort((a, b) => b.probability - a.probability);
}
