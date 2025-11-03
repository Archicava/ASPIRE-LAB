import { CaseForm } from '@/components/case-form';
import { Hero } from '@/components/hero';
import { platformConfig } from '@/lib/config';

export default function NewCasePage() {
  return (
    <main
      style={{
        display: 'grid',
        gap: '1.5rem',
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '0 1.5rem 5rem'
      }}
    >
      <Hero title="New Case" />
      <CaseForm useMocks={platformConfig.useMocks} />
    </main>
  );
}
