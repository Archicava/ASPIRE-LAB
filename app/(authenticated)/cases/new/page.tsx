import { CaseForm } from '@/components/case-form';
import { platformConfig } from '@/lib/config';

export default function NewCasePage() {
  return (
    <main
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 1.5rem 4rem'
      }}
    >
      <CaseForm useMocks={platformConfig.useMocks} />
    </main>
  );
}
