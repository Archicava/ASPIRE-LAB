import { CaseRecord, InferenceJob } from '@/lib/types';
import { CASE_RECORDS, INFERENCE_JOBS } from '@/lib/sample-data';
import { getCohortCaseRecords } from '@/lib/cohort-data';

type GlobalWithMocks = typeof globalThis & {
  __mockCases?: CaseRecord[];
  __mockJobs?: InferenceJob[];
};

const globalWithMocks = globalThis as GlobalWithMocks;

function ensureCases(): CaseRecord[] {
  if (!globalWithMocks.__mockCases) {
    const seedCases = CASE_RECORDS.map(cloneCaseRecord);
    const cohortCases = getCohortCaseRecords()
      .slice(0, 48)
      .map((record) => cloneCaseRecord(record));

    globalWithMocks.__mockCases = [...seedCases, ...cohortCases];
  }
  return globalWithMocks.__mockCases!;
}

function ensureJobs(): InferenceJob[] {
  if (!globalWithMocks.__mockJobs) {
    globalWithMocks.__mockJobs = INFERENCE_JOBS.map((job) => ({ ...job }));
  }
  return globalWithMocks.__mockJobs!;
}

export function listMockCases(): CaseRecord[] {
  return ensureCases();
}

export function listMockJobs(): InferenceJob[] {
  return ensureJobs();
}

export function addMockCase(record: CaseRecord) {
  const store = ensureCases();
  store.unshift(record);
}

export function addMockJob(job: InferenceJob) {
  const store = ensureJobs();
  store.unshift(job);
}

export function findMockCase(caseId: string): CaseRecord | undefined {
  return ensureCases().find((item) => item.id === caseId);
}


function cloneCaseRecord(record: CaseRecord): CaseRecord {
  return {
    ...record,
    demographics: {
      ...record.demographics,
      prenatalFactors: [...record.demographics.prenatalFactors]
    },
    development: {
      ...record.development,
      delays: [...record.development.delays],
      comorbidities: [...record.development.comorbidities]
    },
    assessments: { ...record.assessments },
    behaviors: {
      ...record.behaviors,
      concerns: [...record.behaviors.concerns]
    },
    inference: {
      ...record.inference,
      categories: record.inference.categories.map((category) => ({ ...category })),
      recommendedActions: [...record.inference.recommendedActions]
    },
    artifacts: record.artifacts ? { ...record.artifacts } : undefined
  };
}
