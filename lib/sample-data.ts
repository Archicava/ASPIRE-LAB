import { CaseRecord, InferenceJob } from './types';

export const CASE_RECORDS: CaseRecord[] = [
  {
    id: 'R1-2024-0198',
    submittedAt: '2024-03-22T08:15:00Z',
    demographics: {
      caseLabel: 'Marin, 4y',
      ageMonths: 48,
      sex: 'Male',
      parentalAge: { mother: 38, father: 42 },
      subtype: 'F84.0 Childhood autism',
      diagnosticAgeMonths: 20,
      prenatalFactors: ['Natural', 'Complication']
    },
    development: {
      delays: ['Language', 'Cognitive'],
      dysmorphicFeatures: false,
      comorbidities: ['Feeding difficulties'],
      regressionObserved: true
    },
    assessments: {
      adirScore: 27,
      adosScore: 14,
      eegAnomalies: true,
      mriFindings: 'Mild periventricular white matter signal variation',
      headCircumference: 51.2
    },
    behaviors: {
      concerns: ['Stereotypy', 'Sensory'],
      languageLevel: 'Delayed',
      sensoryNotes: 'Strong adverse response to high-frequency sounds.'
    },
    notes:
      'Responds positively to joint attention prompts. Parent-reported regression after febrile episode.',
    jobId: 'JOB-42891',
    artifacts: {
      payloadCid: 'bafybeigdyrmockcase0198'
    },
    inference: {
      topPrediction: 'Profound ASD with sensory dysregulation',
      categories: [
        {
          label: 'Profound ASD with sensory dysregulation',
          probability: 0.72,
          narrative:
            'ADOS+EEG profile matches high-severity sensory cohort with 70% overlap in Ratio1 historical data.'
        },
        {
          label: 'Autism with emerging verbal communication',
          probability: 0.21
        },
        {
          label: 'Complex developmental delay',
          probability: 0.07
        }
      ],
      explanation:
        'Elevated ADOS calibrated severity score and confirmed EEG anomalies align with the sensory dysregulation cluster identified in the Romanian dataset.',
      recommendedActions: [
        'Prioritize auditory desensitization modules in ABA plan.',
        'Schedule repeat EEG in 6 months to evaluate epileptiform evolution.',
        'Coordinate with nutrition specialist for feeding comorbidity.'
      ]
    }
  },
  {
    id: 'R1-2024-0211',
    submittedAt: '2024-04-04T10:42:00Z',
    demographics: {
      caseLabel: 'Irina, 6y',
      ageMonths: 72,
      sex: 'Female',
      parentalAge: { mother: 34, father: 36 },
      subtype: 'F84.5 Asperger syndrome',
      diagnosticAgeMonths: 42,
      prenatalFactors: ['IVF']
    },
    development: {
      delays: ['Motor'],
      dysmorphicFeatures: false,
      comorbidities: ['Dyspraxia'],
      regressionObserved: false
    },
    assessments: {
      adirScore: 18,
      adosScore: 9,
      eegAnomalies: false,
      mriFindings: null,
      headCircumference: 50.1
    },
    behaviors: {
      concerns: ['Hyperactivity'],
      languageLevel: 'Functional',
      sensoryNotes: 'Seeks deep pressure inputs for self-regulation.'
    },
    notes:
      'Strength in visual problem-solving. Social reciprocity improving with peer modeling.',
    jobId: 'JOB-43911',
    artifacts: {
      payloadCid: 'bafybeigdyrmockcase0211'
    },
    inference: {
      topPrediction: 'High-functioning ASD with motor planning challenges',
      categories: [
        {
          label: 'High-functioning ASD with motor planning challenges',
          probability: 0.64
        },
        { label: 'ADHD co-occurring phenotype', probability: 0.25 },
        { label: 'Mild dyspraxia without ASD', probability: 0.11 }
      ],
      explanation:
        'Motor coordination markers and delayed diagnosis age correlate with the high-functioning motor planning subgroup in the cohort.',
      recommendedActions: [
        'Integrate motor sequencing modules into therapy.',
        'Monitor attention regulation; consider QbTest if symptoms persist.',
        'Offer social narrative coaching for classroom transitions.'
      ]
    }
  },
  {
    id: 'R1-2024-0307',
    submittedAt: '2024-04-29T13:05:00Z',
    demographics: {
      caseLabel: 'Bogdan, 3y',
      ageMonths: 36,
      sex: 'Male',
      parentalAge: { mother: 29, father: 33 },
      subtype: 'F84.0 Childhood autism',
      diagnosticAgeMonths: 18,
      prenatalFactors: ['Twin', 'Complication']
    },
    development: {
      delays: ['Language', 'Global'],
      dysmorphicFeatures: true,
      comorbidities: ['Congenital heart defect'],
      regressionObserved: false
    },
    assessments: {
      adirScore: 30,
      adosScore: 16,
      eegAnomalies: true,
      mriFindings: 'Corpus callosum thinning',
      headCircumference: 52.4
    },
    behaviors: {
      concerns: ['Aggressivity', 'Self-injury'],
      languageLevel: 'Absent',
      sensoryNotes: 'Prefers proprioceptive feedback; requires weighted vest for focus.'
    },
    notes:
      'Genetic consult pending. Family history of ASD in maternal lineage. No evidence of regression but persistent adaptive deficits.',
    jobId: 'JOB-46220',
    artifacts: {
      payloadCid: 'bafybeigdyrmockcase0307'
    },
    inference: {
      topPrediction: 'ASD with syndromic features and high sensory load',
      categories: [
        { label: 'ASD with syndromic features and high sensory load', probability: 0.79 },
        { label: 'Syndromic developmental delay without ASD', probability: 0.13 },
        { label: 'Autism with comorbid epilepsy', probability: 0.08 }
      ],
      explanation:
        'Dysmorphic features plus neonatal complications map to the syndromic subgroup identified in 19% of the Romanian cohort.',
      recommendedActions: [
        'Expedite genetic microarray and syndromic panel.',
        'Integrate harm-reduction behavior protocol focused on self-injury.',
        'Review cardiology clearance before intensive sensory therapies.'
      ]
    }
  }
];

export const INFERENCE_JOBS: InferenceJob[] = [
  {
    id: 'JOB-42891',
    caseId: 'R1-2024-0198',
    status: 'succeeded',
    submittedAt: '2024-03-22T08:15:04Z',
    completedAt: '2024-03-22T08:16:41Z',
    edgeNode: 'EdgeNode-RO-03',
    payloadCid: 'bafybeigdyrmockcase0198',
    statusHistory: [
      { status: 'queued', timestamp: '2024-03-22T08:15:04Z' },
      { status: 'running', timestamp: '2024-03-22T08:15:22Z' },
      { status: 'succeeded', timestamp: '2024-03-22T08:16:41Z' }
    ],
    result: CASE_RECORDS[0].inference
  },
  {
    id: 'JOB-43911',
    caseId: 'R1-2024-0211',
    status: 'succeeded',
    submittedAt: '2024-04-04T10:42:11Z',
    completedAt: '2024-04-04T10:42:59Z',
    edgeNode: 'EdgeNode-EU-11',
    payloadCid: 'bafybeigdyrmockcase0211',
    statusHistory: [
      { status: 'queued', timestamp: '2024-04-04T10:42:11Z' },
      { status: 'running', timestamp: '2024-04-04T10:42:24Z' },
      { status: 'succeeded', timestamp: '2024-04-04T10:42:59Z' }
    ],
    result: CASE_RECORDS[1].inference
  },
  {
    id: 'JOB-46220',
    caseId: 'R1-2024-0307',
    status: 'running',
    submittedAt: '2024-04-29T13:05:17Z',
    edgeNode: 'EdgeNode-RO-05',
    payloadCid: 'bafybeigdyrmockcase0307',
    statusHistory: [
      { status: 'queued', timestamp: '2024-04-29T13:05:17Z' },
      { status: 'running', timestamp: '2024-04-29T13:05:35Z' }
    ]
  }
];
