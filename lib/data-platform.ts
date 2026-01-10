import { Buffer } from 'node:buffer';

import { platformConfig } from '@/lib/config';
import { getCohortCaseRecords } from '@/lib/cohort-data';
import { CaseRecord, CaseSubmission, InferenceJob, InferenceJobStatus, InferenceResult } from '@/lib/types';
import { getRatio1NodeClient } from '@/lib/ratio1-client';

type ParsedHash<T> = {
  items: T[];
  raw: Record<string, unknown>;
};

function parseHashPayload<T>(payload: unknown): ParsedHash<T> {
  const result: ParsedHash<T> = {
    items: [],
    raw: {}
  };

  if (!payload || typeof payload !== 'object') {
    return result;
  }

  const entries = Object.entries(payload as Record<string, unknown>);

  for (const [key, value] of entries) {
    result.raw[key] = value;

    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item && typeof item === 'object') {
          result.items.push(item as T);
        }
      });
      continue;
    }

    if (typeof value === 'object') {
      result.items.push(value as T);
      continue;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && typeof item === 'object') {
              result.items.push(item as T);
            }
          });
        } else if (parsed && typeof parsed === 'object') {
          result.items.push(parsed as T);
        }
      } catch {
        // Ignore malformed JSON entries
      }
    }
  }

  return result;
}

export async function loadCaseRecords(): Promise<CaseRecord[]> {
  const client = getRatio1NodeClient();
  const response = await client.cstore.hgetall({ hkey: platformConfig.casesHKey });

  const parsed = parseHashPayload<CaseRecord>((response as any).result ?? response);
  return parsed.items;
}

export function loadCohortSeedCases(limit?: number): CaseRecord[] {
  const records = getCohortCaseRecords();
  if (typeof limit === 'number') {
    return records.slice(0, limit);
  }
  return records;
}

export async function loadCaseRecord(caseId: string): Promise<CaseRecord | undefined> {
  const client = getRatio1NodeClient();
  const response = await client.cstore.hget({ hkey: platformConfig.casesHKey, key: caseId });

  const value = (response as any).result ?? (response as any)?.value ?? response;

  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as CaseRecord;
    } catch {
      return undefined;
    }
  }

  if (typeof value === 'object') {
    return value as CaseRecord;
  }

  return undefined;
}

export async function loadInferenceJobs(): Promise<InferenceJob[]> {
  const client = getRatio1NodeClient();
  const response = await client.cstore.hgetall({ hkey: platformConfig.jobsHKey });

  const parsed = parseHashPayload<InferenceJob>((response as any).result ?? response);
  return parsed.items;
}

export async function loadInferenceJob(jobId: string): Promise<InferenceJob | undefined> {
  const client = getRatio1NodeClient();
  const response = await client.cstore.hget({ hkey: platformConfig.jobsHKey, key: jobId });

  const value = (response as any).result ?? (response as any)?.value ?? response;
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as InferenceJob;
    } catch {
      return undefined;
    }
  }

  if (typeof value === 'object') {
    return value as InferenceJob;
  }

  return undefined;
}

export async function loadPlatformStatus(): Promise<{
  cstore?: Record<string, unknown>;
  r1fs?: Record<string, unknown>;
}> {
  const client = getRatio1NodeClient();
  const [cstoreStatus, r1fsStatus] = await Promise.all([
    client.cstore.getStatus(),
    client.r1fs.getStatus()
  ]);

  return {
    cstore: cstoreStatus as unknown as Record<string, unknown>,
    r1fs: r1fsStatus as unknown as Record<string, unknown>
  };
}

export async function storeCaseSubmission(
  submission: CaseSubmission,
  inferenceOverride?: InferenceResult
): Promise<CaseRecord> {
  const timestamp = new Date();
  const id = createCaseId(timestamp);
  const jobId = createJobId(timestamp);

  const inference: InferenceResult =
    inferenceOverride ||
    ({
      topPrediction: 'Pending inference',
      categories: [
        { label: 'Awaiting Ratio1 job', probability: 1 }
      ],
      explanation: 'Inference job has been queued and is awaiting execution on a Ratio1 Edge Node.',
      recommendedActions: ['Monitor job queue for completion.', 'Notify caregivers once results are available.']
    } satisfies InferenceResult);

  const record: CaseRecord = {
    ...submission,
    id,
    submittedAt: timestamp.toISOString(),
    inference,
    jobId,
    artifacts: {}
  };

  return storeCaseInLiveMode(record, submission, timestamp);
}

function createCaseId(timestamp: Date) {
  const baseId = `R1-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(
    timestamp.getDate()
  ).padStart(2, '0')}`;
  return `${baseId}-${timestamp.getTime().toString().slice(-4)}`;
}

function createJobId(timestamp: Date) {
  return `JOB-${timestamp.getTime()}`;
}

function createStatusHistory(status: InferenceJobStatus, timestamp: Date) {
  return [{ status, timestamp: timestamp.toISOString() }];
}

async function storeCaseInLiveMode(
  record: CaseRecord,
  submission: CaseSubmission,
  timestamp: Date
): Promise<CaseRecord> {
  const client = getRatio1NodeClient();

  const payload = {
    caseId: record.id,
    submittedAt: record.submittedAt,
    submission
  };

  let payloadCid: string | undefined;
  let edgeNode: string | undefined;

  try {
    const uploadResponse = await client.r1fs.addFileBase64({
      file_base64_str: Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64'),
      filename: `${record.id}.json`
    });

    const cidCandidate =
      (uploadResponse as any)?.result?.cid ??
      (uploadResponse as any)?.cid ??
      uploadResponse ??
      undefined;

    payloadCid = typeof cidCandidate === 'string' ? cidCandidate : undefined;
    edgeNode =
      (uploadResponse as any)?.ee_node_address ??
      (uploadResponse as any)?.result?.ee_node_address ??
      undefined;
  } catch (error) {
    console.error('[storeCaseInLiveMode] Failed to persist payload to R1FS', error);
  }

  record.artifacts = {
    payloadCid: payloadCid ?? record.artifacts?.payloadCid
  };

  const job: InferenceJob = {
    id: record.jobId ?? createJobId(timestamp),
    caseId: record.id,
    status: 'queued',
    submittedAt: timestamp.toISOString(),
    edgeNode,
    payloadCid,
    statusHistory: createStatusHistory('queued', timestamp)
  };

  record.jobId = job.id;

  await client.cstore.hset({
    hkey: platformConfig.casesHKey,
    key: record.id,
    value: JSON.stringify(record)
  });

  await client.cstore.hset({
    hkey: platformConfig.jobsHKey,
    key: job.id,
    value: JSON.stringify(job)
  });

  return record;
}
