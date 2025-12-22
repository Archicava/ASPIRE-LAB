import { notFound } from 'next/navigation';

import { PredictiveLab } from '@/components/predictive-lab';
import { Hero } from '@/components/hero';
import { loadCaseRecord, loadCaseRecords } from '@/lib/data-platform';

export default async function PredictPage({ searchParams }: { searchParams?: { caseId?: string } }) {
  const [cases, seedCase] = await Promise.all([
    loadCaseRecords(),
    searchParams?.caseId ? loadCaseRecord(searchParams.caseId) : Promise.resolve(undefined)
  ]);

  if (searchParams?.caseId && !seedCase) {
    notFound();
  }

  return (
    <main className="page-shell">
      <Hero title="Predictive Lab" />
      <PredictiveLab cases={cases} seedCase={seedCase} />
    </main>
  );
}
