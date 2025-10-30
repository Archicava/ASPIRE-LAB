import { notFound } from 'next/navigation';

import { PredictiveLab } from '@/components/predictive-lab';
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
    <main
      style={{
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '0 1.5rem 4rem'
      }}
    >
      <PredictiveLab cases={cases} seedCase={seedCase} />
    </main>
  );
}
