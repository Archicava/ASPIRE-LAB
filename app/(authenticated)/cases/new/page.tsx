import { CaseForm } from '@/components/case-form';
import { Hero } from '@/components/hero';

export default function NewCasePage() {
  return (
    <main className="page-shell">
      <Hero title="New Case" />
      <CaseForm />
    </main>
  );
}
