#!/usr/bin/env node
const path = require('node:path');
const { readFileSync, writeFileSync } = require('node:fs');
const xlsx = require('xlsx');

const root = path.resolve(__dirname, '..');

const inputPath = path.join(root, 'data', 'baza de date pacienti 1.xlsx');
const outputSeedPath = path.join(root, 'data', 'cohort-seed.json');
const outputCStorePath = path.join(root, 'data', 'cohort-cstore.json');

function normaliseString(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text.length ? text : fallback;
}

function normaliseGender(value) {
  const text = normaliseString(value);
  if (!text) return null;
  return text.toLowerCase().startsWith('f') ? 'Female' : 'Male';
}

function normalisePregnancyType(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (!text) return 'Unknown';
  if (text.includes('IVF')) return 'IVF';
  if (text.includes('N')) return 'Natural';
  return text || 'Unknown';
}

function normalisePlurality(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (!text) return 'Single';
  if (text.includes('TWIN')) return 'Twin';
  return 'Single';
}

function normaliseEvolution(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (!text) return 'Unknown';
  if (text === 'AN') return 'Abnormal';
  if (text === 'N') return 'Normal';
  return text;
}

function toBooleanFlag(value) {
  const text = normaliseString(value, '').toLowerCase();
  if (!text) return false;
  return ['y', 'yes', 'da', '1', 'true'].includes(text);
}

function parseNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseDelays(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (!text) return [];
  const tokens = text.replace(/[^GMC]/g, '')
    .split('')
    .filter(Boolean);
  const mapped = new Set();
  tokens.forEach((token) => {
    if (token === 'G') mapped.add('Global');
    if (token === 'M') mapped.add('Motor');
    if (token === 'C') mapped.add('Cognitive');
  });
  return Array.from(mapped);
}

function mapLanguage(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (text === 'A') return 'Absent';
  if (text === 'N') return 'Functional';
  if (text) return 'Delayed';
  return 'Functional';
}

function mapPrenatalFactors(pregnancyType, plurality, evolution) {
  const factors = [];
  if (pregnancyType === 'IVF') {
    factors.push('IVF');
  } else if (pregnancyType === 'Natural') {
    factors.push('Natural');
  }
  if (plurality === 'Twin') {
    factors.push('Twin');
  }
  if (evolution === 'Abnormal') {
    factors.push('Complication');
  }
  if (!factors.length) {
    factors.push('Natural');
  }
  return Array.from(new Set(factors));
}

function mapAutismSubtype(code) {
  const text = normaliseString(code, 'F84').toUpperCase();
  if (text.startsWith('F84.5')) return 'F84.5 Asperger syndrome';
  if (text.startsWith('F84.1')) return 'F84.1 Atypical autism';
  return 'F84.0 Childhood autism';
}

function mapEEG(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (text === 'F') return 'Focal';
  if (text === 'G') return 'Bilateral';
  if (text === 'N') return 'Normal';
  return text || 'Unknown';
}

function mapMRI(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (text === 'AN') return 'Anomaly';
  if (text === 'N') return 'Normal';
  return text || 'Unknown';
}

function mapBehaviourConcern(value) {
  return toBooleanFlag(value) ? ['Aggressivity'] : [];
}

function mapComorbidities(row) {
  const entries = [];
  if (toBooleanFlag(row['Other Chronic diseases'])) entries.push('Chronic disease');
  if (toBooleanFlag(row['Infections'])) entries.push('Recurrent infections');
  if (toBooleanFlag(row['allergies'])) entries.push('Allergies');
  return entries;
}

function mapFamilyHistory(value) {
  const text = normaliseString(value, '').toUpperCase();
  if (!text) return 'None reported';
  if (text === 'P') return 'Psychiatric history present';
  if (text === 'NE') return 'Neurological history present';
  if (text === 'NO') return 'None reported';
  return text;
}

function normaliseAgeMonths(value) {
  const ageNum = parseNumber(value);
  if (ageNum === null) {
    return null;
  }
  if (ageNum > 25) {
    return Math.round(ageNum);
  }
  return Math.round(ageNum * 12);
}

function createPendingInference(message) {
  return {
    topPrediction: 'Pending inference',
    categories: [{ label: 'Awaiting Ratio1 job', probability: 1 }],
    explanation: message,
    recommendedActions: ['Queue inference job on Ratio1 Edge Node.', 'Review neurodevelopmental profile before dispatch.']
  };
}

function ensureDataset() {
  try {
    readFileSync(inputPath);
  } catch (error) {
    console.error(`Missing cohort Excel file at ${inputPath}`);
    process.exit(1);
  }
}

ensureDataset();

const workbook = xlsx.readFile(inputPath, { cellDates: false });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

const seedEntries = [];
const cstoreRecords = {};

const baseDate = new Date(Date.UTC(2024, 0, 1, 8, 0, 0));

rows.forEach((row, index) => {
  const gender = normaliseGender(row['Gender']);
  if (!gender) {
    return;
  }

  const caseId = `ASD-${String(index + 1).padStart(3, '0')}`;
  const pregnancyType = normalisePregnancyType(row['Pregnancy natural /IVF']);
  const plurality = normalisePlurality(row['Single/twins']);
  const evolution = normaliseEvolution(row['Pregnancy evolution, N=normal, AN=abnormal']);
  const diagnosisAge = parseNumber(row['Age at diagnosis for autism- months']);
  const languageLevel = mapLanguage(row['Language development: delay, normal=N, absent=A']);
  const eegStatus = mapEEG(row['EEG, N=normal, F=focal discharges, G=bilateral discharges']);
  const mriStatus = mapMRI(row['MRI structural anomalies of the brain, N=absent, AN=present']);
  const delays = parseDelays(row['Developmental milestones- global delay (G), motor delay (M), cognitive delay (C)']);
  const adosScore = parseNumber(row['ADOS score']);
  const adirScore = parseNumber(row['ADI-R score']);
  const submittedAt = new Date(baseDate.getTime() + index * 3_600_000).toISOString();

  seedEntries.push({
    caseId,
    gender,
    pregnancyType,
    plurality,
    pregnancyEvolution: evolution,
    languageLevel,
    eegStatus,
    mriStatus,
    diagnosisAgeMonths: diagnosisAge,
    delays,
    adosScore,
    adirScore
  });

  const caseRecord = {
    id: caseId,
    submittedAt,
    demographics: {
      caseLabel: `Cohort case ${caseId}`,
      ageMonths: normaliseAgeMonths(row['Age']) ?? diagnosisAge ?? 48,
      sex: gender,
      parentalAge: {
        mother: parseNumber(row['Mother age (years)']) ?? 32,
        father: parseNumber(row['Father age (years)']) ?? 35
      },
      subtype: mapAutismSubtype(row['ICD Autism']),
      diagnosticAgeMonths: diagnosisAge ?? 36,
      prenatalFactors: mapPrenatalFactors(pregnancyType, plurality, evolution)
    },
    development: {
      delays: delays.length ? delays : ['Global'],
      dysmorphicFeatures: toBooleanFlag(row['Dysmorphysm y=present, no=absent']),
      comorbidities: mapComorbidities(row),
      regressionObserved: false
    },
    assessments: {
      adosScore: adosScore ?? 10,
      adirScore: adirScore ?? 30,
      eegAnomalies: eegStatus !== 'Normal' && eegStatus !== 'Unknown',
      mriFindings: mriStatus === 'Normal' ? 'Normal MRI' : mriStatus === 'Anomaly' ? 'Structural anomaly observed' : null,
      headCircumference: parseNumber(row['head circumf  ']) ?? 50
    },
    behaviors: {
      concerns: mapBehaviourConcern(row['Behaviour disorder- agressivity, agitation, irascibility']),
      languageLevel,
      sensoryNotes: `${eegStatus === 'Normal' ? 'EEG normal' : `EEG: ${eegStatus}`}; ${mriStatus === 'Normal' ? 'MRI normal' : `MRI: ${mriStatus}`}`
    },
    notes: `Imported from ASD clinical cohort. Family history: ${mapFamilyHistory(row['Family history psychiatric (P) or Neuro disease (Ne), No=absent'])}.`,
    inference: createPendingInference('Seeded from ASD cohort record; dispatch an inference job for live analysis.')
  };

  cstoreRecords[caseId] = caseRecord;
});

writeFileSync(outputSeedPath, JSON.stringify(seedEntries, null, 2));
writeFileSync(outputCStorePath, JSON.stringify(cstoreRecords, null, 2));

console.log(`Processed ${seedEntries.length} cohort records.`);
console.log(`Seed data written to:\n - ${outputSeedPath}\n - ${outputCStorePath}`);
