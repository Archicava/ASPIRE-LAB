export type PrenatalFactor = 'Natural' | 'IVF' | 'Twin' | 'Complication';

export type DevelopmentalDelay = 'None' | 'Motor' | 'Language' | 'Cognitive' | 'Global';

export type BehaviorConcern =
  | 'Aggressivity'
  | 'Self-injury'
  | 'Agitation'
  | 'Stereotypy'
  | 'Hyperactivity'
  | 'Sleep'
  | 'Sensory';

export type AutismSubtype = 'F84.0 Childhood autism' | 'F84.1 Atypical autism' | 'F84.5 Asperger syndrome';

export type CaseSubmission = {
  demographics: {
    caseLabel: string;
    ageMonths: number;
    sex: 'Male' | 'Female';
    parentalAge: {
      mother: number;
      father: number;
    };
    subtype: AutismSubtype;
    diagnosticAgeMonths: number;
    prenatalFactors: PrenatalFactor[];
  };
  development: {
    delays: DevelopmentalDelay[];
    dysmorphicFeatures: boolean;
    comorbidities: string[];
    regressionObserved: boolean;
  };
  assessments: {
    adosScore: number;
    adirScore: number;
    eegAnomalies: boolean;
    mriFindings: string | null;
    headCircumference: number;
  };
  behaviors: {
    concerns: BehaviorConcern[];
    languageLevel: 'Functional' | 'Delayed' | 'Absent';
    sensoryNotes: string;
  };
  notes: string;
};

export type InferenceJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export type InferenceJob = {
  id: string;
  caseId: string;
  status: InferenceJobStatus;
  submittedAt: string;
  completedAt?: string;
  edgeNode?: string;
  payloadCid?: string;
  result?: InferenceResult;
  error?: string;
  statusHistory?: Array<{
    status: InferenceJobStatus;
    timestamp: string;
    message?: string;
  }>;
};

export type InferenceCategory = {
  label: string;
  probability: number;
  narrative?: string;
};

export type InferenceResult = {
  topPrediction: string;
  categories: InferenceCategory[];
  explanation: string;
  recommendedActions: string[];
};

export type CaseRecord = CaseSubmission & {
  id: string;
  submittedAt: string;
  inference: InferenceResult;
  jobId?: string;
  artifacts?: {
    payloadCid?: string;
  };
};

export type PredictiveInput = {
  caseId?: string;
  ageMonths: number;
  languageLevel: 'Functional' | 'Delayed' | 'Absent';
  eegStatus: 'Normal' | 'Focal' | 'Bilateral';
  mriStatus: 'Normal' | 'Anomaly' | 'Unknown';
  prenatalFactors: PrenatalFactor[];
  developmentalDelays: DevelopmentalDelay[];
  dysmorphicFeatures: boolean;
  behavioralConcerns: number;
  comorbidities: number;
};

export type PredictiveScenario = {
  label: string;
  probability: number;
  narrative: string;
};

export type PredictiveResult = {
  topFinding: string;
  scenarios: PredictiveScenario[];
  riskSummary: string;
  recommendations: string[];
};
