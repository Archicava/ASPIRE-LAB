import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CaseRecord } from '@/lib/types';

export type CohortSeedEntry = {
  caseId: string;
  gender: 'Male' | 'Female';
  pregnancyType: string;
  plurality: string;
  pregnancyEvolution: string;
  languageLevel: 'Functional' | 'Delayed' | 'Absent';
  eegStatus: string;
  mriStatus: string;
  diagnosisAgeMonths: number | null;
  delays: string[];
  adosScore: number | null;
  adirScore: number | null;
};

export type CohortStats = {
  totalCases: number;
  gender: Record<'male' | 'female', number>;
  pregnancy: {
    natural: number;
    ivf: number;
    twin: number;
    abnormalEvolution: number;
  };
  language: Record<'functional' | 'delayed' | 'absent', number>;
  delays: Record<'Global' | 'Motor' | 'Cognitive', number>;
  diagnosisAge: {
    mean: number | null;
    median: number | null;
  };
  eegAnomalyRate: number;
  mriAnomalyRate: number;
};

let seedCache: CohortSeedEntry[] | null = null;
let recordCache: CaseRecord[] | null = null;

function readJson<T>(filename: string): T {
  const filePath = join(process.cwd(), 'data', filename);
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function getCohortSeedEntries(): CohortSeedEntry[] {
  if (!seedCache) {
    seedCache = readJson<CohortSeedEntry[]>('cohort-seed.json');
  }
  return seedCache;
}

export function getCohortCaseRecords(): CaseRecord[] {
  if (!recordCache) {
    const map = readJson<Record<string, CaseRecord>>('cohort-cstore.json');
    recordCache = Object.values(map);
  }
  return recordCache;
}

export function getCohortStats(): CohortStats {
  const entries = getCohortSeedEntries();
  const total = entries.length;

  const gender = {
    male: entries.filter((entry) => entry.gender === 'Male').length,
    female: entries.filter((entry) => entry.gender === 'Female').length
  } as const;

  const pregnancy = {
    natural: entries.filter((entry) => entry.pregnancyType === 'Natural').length,
    ivf: entries.filter((entry) => entry.pregnancyType === 'IVF').length,
    twin: entries.filter((entry) => entry.plurality === 'Twin').length,
    abnormalEvolution: entries.filter((entry) => entry.pregnancyEvolution === 'Abnormal').length
  } as const;

  const language = {
    functional: entries.filter((entry) => entry.languageLevel === 'Functional').length,
    delayed: entries.filter((entry) => entry.languageLevel === 'Delayed').length,
    absent: entries.filter((entry) => entry.languageLevel === 'Absent').length
  } as const;

  const delays = entries.reduce(
    (acc, entry) => {
      entry.delays.forEach((delay) => {
        if (delay === 'Global' || delay === 'Motor' || delay === 'Cognitive') {
          acc[delay] += 1;
        }
      });
      return acc;
    },
    { Global: 0, Motor: 0, Cognitive: 0 } as Record<'Global' | 'Motor' | 'Cognitive', number>
  );

  const diagnosisValues = entries
    .map((entry) => entry.diagnosisAgeMonths)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  const diagnosisAge = {
    mean: diagnosisValues.length ? Number((diagnosisValues.reduce((sum, v) => sum + v, 0) / diagnosisValues.length).toFixed(1)) : null,
    median: diagnosisValues.length ? computeMedian(diagnosisValues) : null
  } as const;

  const eegAnomalyCount = entries.filter((entry) => entry.eegStatus !== 'Normal' && entry.eegStatus !== 'Unknown').length;
  const mriAnomalyCount = entries.filter((entry) => entry.mriStatus === 'Anomaly').length;

  return {
    totalCases: total,
    gender,
    pregnancy,
    language,
    delays,
    diagnosisAge,
    eegAnomalyRate: total ? Math.round((eegAnomalyCount / total) * 100) : 0,
    mriAnomalyRate: total ? Math.round((mriAnomalyCount / total) * 100) : 0
  };
}

function computeMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
  }
  return Number(sorted[mid].toFixed(1));
}
