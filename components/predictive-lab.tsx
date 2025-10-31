'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { ProbabilityBars } from '@/components/probability-bars';
import { computePredictiveResult } from '@/lib/predictive';
import { CaseRecord, PredictiveInput } from '@/lib/types';

const eegOptions = ['Normal', 'Focal', 'Bilateral'] as const;
const mriOptions = ['Normal', 'Anomaly', 'Unknown'] as const;
const prenatalOrder = ['Natural', 'IVF', 'Twin', 'Complication'] as const;
const delayOptions = ['Global', 'Cognitive', 'Motor'] as const;

function createDefaultInput(seed?: CaseRecord): PredictiveInput {
  if (seed) {
    return mapCaseToPredictiveInput(seed);
  }

  return {
    caseId: undefined,
    ageMonths: 48,
    languageLevel: 'Delayed',
    eegStatus: 'Normal',
    mriStatus: 'Unknown',
    prenatalFactors: ['Natural'],
    developmentalDelays: ['Cognitive'],
    dysmorphicFeatures: false,
    behavioralConcerns: 1,
    comorbidities: 0
  };
}

export function PredictiveLab({ cases, seedCase }: { cases: CaseRecord[]; seedCase?: CaseRecord }) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | 'custom'>(seedCase?.id ?? 'custom');
  const [input, setInput] = useState<PredictiveInput>(() => createDefaultInput(seedCase));

  useEffect(() => {
    if (seedCase) {
      setInput(createDefaultInput(seedCase));
    }
  }, [seedCase]);

  useEffect(() => {
    if (selectedCaseId === 'custom') {
      setInput((prev) => ({ ...prev, caseId: undefined }));
      return;
    }
    const matched = cases.find((record) => record.id === selectedCaseId);
    if (matched) {
      setInput(mapCaseToPredictiveInput(matched));
    }
  }, [selectedCaseId, cases]);

  const result = useMemo(() => computePredictiveResult(input), [input]);

  return (
    <div
      style={{
        display: 'grid',
        gap: '1.5rem'
      }}
    >
      <section className="card" style={{ padding: '1.6rem', display: 'grid', gap: '1.1rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p className="section-title">Predictive inference lab</p>
            <h1 style={{ margin: '0.35rem 0 0', fontSize: '1.6rem', fontWeight: 600 }}>
              Generate Ratio1 probability scenarios
            </h1>
          </div>
          <select
            value={selectedCaseId}
            onChange={(event) => setSelectedCaseId(event.target.value as typeof selectedCaseId)}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-border)',
              fontSize: '0.95rem'
            }}
          >
            <option value="custom">Manual configuration</option>
            {cases.slice(0, 100).map((record) => (
              <option key={record.id} value={record.id}>
                {record.demographics.caseLabel} ({record.id})
              </option>
            ))}
          </select>
        </header>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Configure the risk factors highlighted in the Romanian ASD cohort to estimate trajectory and
          support levels. Selecting a case pulls its recorded data; manual mode lets you explore what-if
          scenarios before dispatching a Ratio1 edge-node job.
        </p>
      </section>

      <section
        className="card"
        style={{ padding: '1.7rem', display: 'grid', gap: '1.2rem' }}
      >
        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>Clinical inputs</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem'
          }}
        >
          <Field label="Chronological age (months)">
            <input
              type="number"
              min={6}
              max={240}
              value={input.ageMonths}
              onChange={(event) => setInput((prev) => ({ ...prev, ageMonths: Number(event.target.value) }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Language level">
            <select
              value={input.languageLevel}
              onChange={(event) =>
                setInput((prev) => ({ ...prev, languageLevel: event.target.value as PredictiveInput['languageLevel'] }))
              }
              style={inputStyle}
            >
              <option value="Functional">Functional</option>
              <option value="Delayed">Delayed</option>
              <option value="Absent">Absent</option>
            </select>
          </Field>
          <Field label="EEG status">
            <div style={chipRowStyle}>
              {eegOptions.map((option) => {
                const active = input.eegStatus === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, eegStatus: option }))}
                    style={chipStyle(active)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="MRI findings">
            <div style={chipRowStyle}>
              {mriOptions.map((option) => {
                const active = input.mriStatus === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, mriStatus: option }))}
                    style={chipStyle(active)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <Field label="Prenatal factors">
          <div style={chipRowStyle}>
            {prenatalOrder.map((factor) => {
              const active = input.prenatalFactors.includes(factor);
              return (
                <button
                  key={factor}
                  type="button"
                  onClick={() =>
                    setInput((prev) => ({
                      ...prev,
                      prenatalFactors: toggleValue(prev.prenatalFactors, factor)
                    }))
                  }
                  style={chipStyle(active)}
                >
                  {factor}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Developmental delays">
          <div style={chipRowStyle}>
            {delayOptions.map((delay) => {
              const active = input.developmentalDelays.includes(delay as any);
              return (
                <button
                  key={delay}
                  type="button"
                  onClick={() =>
                    setInput((prev) => ({
                      ...prev,
                      developmentalDelays: toggleValue(prev.developmentalDelays, delay as any)
                    }))
                  }
                  style={chipStyle(active)}
                >
                  {delay}
                </button>
              );
            })}
          </div>
        </Field>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          <Field label="Dysmorphic features">
            <Toggle
              value={input.dysmorphicFeatures}
              onChange={(value) => setInput((prev) => ({ ...prev, dysmorphicFeatures: value }))}
            />
          </Field>
          <Field label="Behavioural concerns (count)">
            <NumberStepper
              value={input.behavioralConcerns}
              min={0}
              max={6}
              onChange={(value) => setInput((prev) => ({ ...prev, behavioralConcerns: value }))}
            />
          </Field>
          <Field label="Comorbidities (count)">
            <NumberStepper
              value={input.comorbidities}
              min={0}
              max={6}
              onChange={(value) => setInput((prev) => ({ ...prev, comorbidities: value }))}
            />
          </Field>
        </div>
      </section>

      <section className="card" style={{ padding: '1.7rem', display: 'grid', gap: '1rem' }}>
        <header>
          <p className="section-title">Predictive scenarios</p>
          <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.4rem', fontWeight: 600 }}>{result.topFinding}</h2>
        </header>
        <ProbabilityBars categories={result.scenarios.map((scenario) => ({
          label: scenario.label,
          probability: scenario.probability,
          narrative: scenario.narrative
        }))}
        />
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{result.riskSummary}</p>
        <div style={{ display: 'grid', gap: '0.45rem' }}>
          {result.recommendations.map((item) => (
            <div
              key={item}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-border)',
                background: 'rgba(91,108,240,0.06)',
                color: 'var(--color-text-secondary)' 
              }}
            >
              • {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function toggleValue<T>(array: readonly T[], value: T): T[] {
  const exists = array.includes(value);
  if (exists) {
    return array.filter((item) => item !== value);
  }
  return [...array, value];
}

function mapCaseToPredictiveInput(record: CaseRecord): PredictiveInput {
  const eegStatus: PredictiveInput['eegStatus'] = record.assessments.eegAnomalies ? 'Focal' : 'Normal';
  const mriStatus: PredictiveInput['mriStatus'] = record.assessments.mriFindings
    ? record.assessments.mriFindings.toLowerCase().includes('normal')
      ? 'Normal'
      : 'Anomaly'
    : 'Unknown';

  return {
    caseId: record.id,
    ageMonths: record.demographics.ageMonths,
    languageLevel: record.behaviors.languageLevel,
    eegStatus,
    mriStatus,
    prenatalFactors: [...record.demographics.prenatalFactors],
    developmentalDelays: [...record.development.delays],
    dysmorphicFeatures: record.development.dysmorphicFeatures,
    behavioralConcerns: record.behaviors.concerns.length,
    comorbidities: record.development.comorbidities.length
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem' }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        borderRadius: '999px',
        border: '1px solid var(--color-border)',
        padding: '0.45rem 1rem',
        fontWeight: 600,
        background: value ? 'var(--color-accent)' : 'var(--color-card)',
        color: value ? 'white' : 'var(--color-text-secondary)',
        cursor: 'pointer'
      }}
    >
      {value ? 'Yes' : 'No'}
    </button>
  );
}

function NumberStepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        style={stepperButtonStyle}
      >
        −
      </button>
      <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        style={stepperButtonStyle}
      >
        +
      </button>
    </div>
  );
}

const inputStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  background: 'rgba(234, 242, 255, 0.95)'
};

const chipRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem'
};

function chipStyle(active: boolean): CSSProperties {
  return {
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    border: active ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
    background: active ? 'var(--color-accent-soft)' : 'rgba(226, 236, 255, 0.9)',
    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    fontWeight: 600,
    cursor: 'pointer'
  };
}

const stepperButtonStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  fontWeight: 600,
  cursor: 'pointer'
};
