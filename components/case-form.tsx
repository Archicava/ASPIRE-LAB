'use client';

import { type CSSProperties, FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { useToast } from '@/components/toast';
import type { CaseRecord, CaseSubmission } from '@/lib/types';

type CaseFormProps = {
  useMocks?: boolean;
};

const prenatalOptions = ['Natural', 'IVF', 'Twin', 'Complication'] as const;
const delayOptions = ['None', 'Motor', 'Language', 'Cognitive', 'Global'] as const;
const concernOptions = [
  'Aggressivity',
  'Self-injury',
  'Agitation',
  'Stereotypy',
  'Hyperactivity',
  'Sleep',
  'Sensory'
] as const;
const subtypeOptions = [
  'F84.0 Childhood autism',
  'F84.1 Atypical autism',
  'F84.5 Asperger syndrome'
] as const;

const schema = z.object({
  caseLabel: z.string().min(2),
  ageMonths: z.number().min(6).max(216),
  sex: z.enum(['Male', 'Female']),
  parentalAgeMother: z.number().min(16).max(55),
  parentalAgeFather: z.number().min(16).max(70),
  subtype: z.enum(subtypeOptions),
  diagnosticAgeMonths: z.number().min(6).max(216),
  prenatalFactors: z.array(z.enum(prenatalOptions)).min(1),
  delays: z.array(z.enum(delayOptions)).min(1),
  dysmorphicFeatures: z.boolean(),
  comorbidities: z.string(),
  regressionObserved: z.boolean(),
  adosScore: z.number().min(1).max(30),
  adirScore: z.number().min(1).max(40),
  eegAnomalies: z.boolean(),
  mriFindings: z.string().optional(),
  headCircumference: z.number().min(40).max(60),
  concerns: z.array(z.enum(concernOptions)).min(1),
  languageLevel: z.enum(['Functional', 'Delayed', 'Absent']),
  sensoryNotes: z.string().optional(),
  notes: z.string().min(10)
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  caseLabel: '',
  ageMonths: 48,
  sex: 'Male',
  parentalAgeMother: 32,
  parentalAgeFather: 35,
  subtype: 'F84.0 Childhood autism',
  diagnosticAgeMonths: 18,
  prenatalFactors: ['Natural'],
  delays: ['Language'],
  dysmorphicFeatures: false,
  comorbidities: '',
  regressionObserved: false,
  adosScore: 12,
  adirScore: 20,
  eegAnomalies: false,
  mriFindings: '',
  headCircumference: 50,
  concerns: ['Sensory'],
  languageLevel: 'Delayed',
  sensoryNotes: '',
  notes: ''
};

export function CaseForm({ useMocks = true }: CaseFormProps) {
  const [values, setValues] = useState<FormValues>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleToggle = <K extends keyof FormValues>(key: K, option: string) => {
    setValues((prev) => {
      const current = prev[key];
      if (Array.isArray(current)) {
        const exists = current.includes(option);
        const next = exists ? current.filter((item) => item !== option) : [...current, option];
        return { ...prev, [key]: next };
      }
      return prev;
    });
  };

  const handleBoolean = <K extends keyof FormValues>(key: K, value: boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const numericChange =
    <K extends keyof FormValues>(key: K) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [key]: Number(event.target.value) }));
    };

  const textChange =
    <K extends keyof FormValues>(key: K) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const validationErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        validationErrors[path] = issue.message;
      });
      setErrors(validationErrors);
      toast.show({
        title: 'Validation failed',
        description: 'Review highlighted fields to align with the clinical schema.',
        tone: 'danger'
      });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const submission = toSubmission(values);
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error('Failed to submit case');
      }

      const created: CaseRecord = await response.json();

      toast.show({
        title: 'Case staged for inference',
        description: useMocks
          ? 'Stored locally in mock mode; inference result generated for prototyping.'
          : 'Submission persisted to Ratio1 CStore; awaiting edge node inference.',
        tone: 'success'
      });

      router.push(`/cases/${created.id}`);
    } catch (error) {
      console.error('Case submission failed', error);
      toast.show({
        title: 'Submission failed',
        description: 'Retry or check the platform logs for more detail.',
        tone: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const computedComplexity = useMemo(() => {
    const factors = values.prenatalFactors.length + values.concerns.length;
    if (factors >= 5) return 'High complexity';
    if (factors >= 3) return 'Moderate complexity';
    return 'Targeted profile';
  }, [values.concerns.length, values.prenatalFactors.length]);

  return (
    <form
      onSubmit={handleSubmit}
      className="card fade-in"
      style={{
        padding: '2rem',
        display: 'grid',
        gap: '2rem'
      }}
    >
      <header style={{ display: 'grid', gap: '0.6rem' }}>
        <span className="pill">Case submission wizard</span>
        <h1 style={{ margin: 0, fontSize: '1.85rem' }}>Describe the clinical presentation</h1>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Capture the full ASD profile across prenatal history, developmental milestones, and
          neuro-behavioral assessments. Data stays on-device until you dispatch the Ratio1 job.
        </p>
        <span
          className="pill"
          style={{
            background: 'rgba(91, 108, 240, 0.1)',
            color: 'var(--color-accent)'
          }}
        >
          {computedComplexity}
        </span>
      </header>

      <section style={{ display: 'grid', gap: '1.4rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Demographics</h2>
        <div className="grid-two">
          <Field label="Case label" error={errors.caseLabel}>
            <input
              value={values.caseLabel}
              onChange={textChange('caseLabel')}
              style={inputStyle}
              placeholder="Popescu, 4y"
            />
          </Field>
          <Field label="Age (months)">
            <input
              type="number"
              min={6}
              max={216}
              value={values.ageMonths}
              onChange={numericChange('ageMonths')}
              style={inputStyle}
            />
          </Field>
          <Field label="Sex">
            <select value={values.sex} onChange={textChange('sex')} style={inputStyle}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>
          <Field label="Autism subtype">
            <select value={values.subtype} onChange={textChange('subtype')} style={inputStyle}>
              {subtypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Diagnostic age (months)">
            <input
              type="number"
              min={6}
              max={216}
              value={values.diagnosticAgeMonths}
              onChange={numericChange('diagnosticAgeMonths')}
              style={inputStyle}
            />
          </Field>
          <Field label="Parental age - mother">
            <input
              type="number"
              min={16}
              max={55}
              value={values.parentalAgeMother}
              onChange={numericChange('parentalAgeMother')}
              style={inputStyle}
            />
          </Field>
          <Field label="Parental age - father">
            <input
              type="number"
              min={16}
              max={70}
              value={values.parentalAgeFather}
              onChange={numericChange('parentalAgeFather')}
              style={inputStyle}
            />
          </Field>
        </div>
        <CheckboxGroup
          label="Prenatal and perinatal factors"
          options={prenatalOptions}
          values={values.prenatalFactors}
          onToggle={(option) => handleToggle('prenatalFactors', option)}
          error={errors.prenatalFactors}
        />
      </section>

      <section style={{ display: 'grid', gap: '1.4rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Developmental profile</h2>
        <CheckboxGroup
          label="Developmental delays"
          options={delayOptions}
          values={values.delays}
          onToggle={(option) => handleToggle('delays', option)}
          error={errors.delays}
        />
        <ToggleRow
          label="Dysmorphic features observed"
          value={values.dysmorphicFeatures}
          onChange={(val) => handleBoolean('dysmorphicFeatures', val)}
        />
        <ToggleRow
          label="Regression documented"
          value={values.regressionObserved}
          onChange={(val) => handleBoolean('regressionObserved', val)}
        />
        <Field label="Comorbidities">
          <input
            value={values.comorbidities}
            onChange={textChange('comorbidities')}
            style={inputStyle}
            placeholder="Epilepsy, GI disturbance"
          />
        </Field>
      </section>

      <section style={{ display: 'grid', gap: '1.4rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Clinical assessments</h2>
        <div className="grid-two">
          <Field label="ADOS calibrated score">
            <input
              type="number"
              min={1}
              max={30}
              value={values.adosScore}
              onChange={numericChange('adosScore')}
              style={inputStyle}
            />
          </Field>
          <Field label="ADI-R total">
            <input
              type="number"
              min={1}
              max={40}
              value={values.adirScore}
              onChange={numericChange('adirScore')}
              style={inputStyle}
            />
          </Field>
          <ToggleRow
            label="EEG anomalies"
            value={values.eegAnomalies}
            onChange={(val) => handleBoolean('eegAnomalies', val)}
          />
          <Field label="Head circumference (cm)">
            <input
              type="number"
              min={40}
              max={60}
              value={values.headCircumference}
              onChange={numericChange('headCircumference')}
              style={inputStyle}
            />
          </Field>
        </div>
        <Field label="MRI findings">
          <textarea
            value={values.mriFindings ?? ''}
            onChange={textChange('mriFindings')}
            rows={3}
            style={textareaStyle}
            placeholder="Normal structural MRI"
          />
        </Field>
      </section>

      <section style={{ display: 'grid', gap: '1.4rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Behavior and sensory profile</h2>
        <CheckboxGroup
          label="Behavioral concerns"
          options={concernOptions}
          values={values.concerns}
          onToggle={(option) => handleToggle('concerns', option)}
          error={errors.concerns}
        />
        <Field label="Language level">
          <select value={values.languageLevel} onChange={textChange('languageLevel')} style={inputStyle}>
            <option value="Functional">Functional</option>
            <option value="Delayed">Delayed</option>
            <option value="Absent">Absent</option>
          </select>
        </Field>
        <Field label="Sensory notes">
          <textarea
            value={values.sensoryNotes ?? ''}
            onChange={textChange('sensoryNotes')}
            rows={3}
            style={textareaStyle}
            placeholder="Seeks proprioceptive input, hypersensitive to auditory stimuli"
          />
        </Field>
      </section>

      <section style={{ display: 'grid', gap: '1.4rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Clinical narrative</h2>
        <Field label="Notes" error={errors.notes}>
          <textarea
            value={values.notes}
            onChange={textChange('notes')}
            rows={5}
            style={textareaStyle}
            placeholder="Summarize primary concerns, intervention history, and family context."
          />
        </Field>
      </section>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Submission encrypts data client-side and registers job metadata within CStore namespace ASD-RO-01.
        </p>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.95rem 2.1rem',
            borderRadius: '999px',
            background: 'var(--color-accent)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            opacity: submitting ? 0.65 : 1
          }}
        >
          {submitting ? 'Queuing job…' : 'Dispatch inference'}
        </button>
      </footer>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem' }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
      {error ? (
        <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{error}</span>
      ) : null}
    </label>
  );
}

function CheckboxGroup({
  label,
  options,
  values,
  onToggle,
  error
}: {
  label: string;
  options: readonly string[];
  values: readonly string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem'
        }}
      >
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '999px',
                border: active ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: active ? 'var(--color-accent-soft)' : 'rgba(255,255,255,0.9)',
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error ? (
        <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{error}</span>
      ) : null}
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.9rem 1.2rem',
        borderRadius: '0.9rem',
        border: '1px solid var(--color-border)',
        background: 'rgba(255,255,255,0.9)'
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <label style={{ position: 'relative', width: '42px', height: '24px' }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          style={{ display: 'none' }}
        />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '999px',
            background: value ? 'var(--color-accent)' : 'var(--color-border)',
            transition: 'all 150ms ease'
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: value ? '22px' : '3px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'white',
            transition: 'left 150ms ease',
            boxShadow: '0 4px 12px rgba(17,24,39,0.15)'
          }}
        />
      </label>
    </div>
  );
}

const inputStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  background: 'rgba(255,255,255,0.95)'
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical'
};

function toSubmission(values: FormValues): CaseSubmission {
  return {
    demographics: {
      caseLabel: values.caseLabel,
      ageMonths: values.ageMonths,
      sex: values.sex,
      parentalAge: {
        mother: values.parentalAgeMother,
        father: values.parentalAgeFather
      },
      subtype: values.subtype,
      diagnosticAgeMonths: values.diagnosticAgeMonths,
      prenatalFactors: [...values.prenatalFactors]
    },
    development: {
      delays: [...values.delays],
      dysmorphicFeatures: values.dysmorphicFeatures,
      comorbidities: values.comorbidities
        ? values.comorbidities.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
      regressionObserved: values.regressionObserved
    },
    assessments: {
      adosScore: values.adosScore,
      adirScore: values.adirScore,
      eegAnomalies: values.eegAnomalies,
      mriFindings: values.mriFindings?.trim() ? values.mriFindings.trim() : null,
      headCircumference: values.headCircumference
    },
    behaviors: {
      concerns: [...values.concerns],
      languageLevel: values.languageLevel,
      sensoryNotes: values.sensoryNotes?.trim() ?? ''
    },
    notes: values.notes.trim()
  };
}
