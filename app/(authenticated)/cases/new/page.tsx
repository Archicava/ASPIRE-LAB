import { CaseForm } from '@/components/case-form';
import { Hero } from '@/components/hero';
import { platformConfig } from '@/lib/config';

export default function NewCasePage() {
  return (
    <main className="page-shell">
      <Hero title="New Case" />
      <CaseForm useMocks={platformConfig.useMocks} />
    </main>
  );
}
