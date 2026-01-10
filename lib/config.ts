const rawDebug = process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true';

function ensureHttpProtocol(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://${url}`;
}

function parseChainstorePeers(value: string | undefined): string[] {
  const raw = value?.trim();
  if (!raw) {
    return [];
  }

  try {
    let cleaned = raw;

    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1);
    }

    cleaned = cleaned.replace(/'/g, '"');
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error('CHAINSTORE_PEERS must be a JSON array');
    }

    return parsed.map((entry) => {
      if (typeof entry !== 'string') {
        throw new Error('CHAINSTORE_PEERS entries must be strings');
      }
      return ensureHttpProtocol(entry)!;
    });
  } catch (error) {
    console.error('Failed to parse CHAINSTORE_PEERS env var:', error);
    throw error;
  }
}

const cstoreApiUrl = ensureHttpProtocol(
  process.env.R1EN_CHAINSTORE_API_URL ||
    process.env.EE_CHAINSTORE_API_URL ||
    process.env.CHAINSTORE_API_URL
);

const r1fsApiUrl = ensureHttpProtocol(
  process.env.R1EN_R1FS_API_URL || process.env.EE_R1FS_API_URL || process.env.R1FS_API_URL
);

const chainstorePeers = parseChainstorePeers(
  process.env.R1EN_CHAINSTORE_PEERS ||
    process.env.EE_CHAINSTORE_PEERS ||
    process.env.CHAINSTORE_PEERS
);

if (!cstoreApiUrl || !r1fsApiUrl) {
  throw new Error(
    'Missing Ratio1 endpoints. Set R1EN_CHAINSTORE_API_URL and R1EN_R1FS_API_URL (or EE_/legacy variants).'
  );
}

const authSessionCookieName = process.env.AUTH_SESSION_COOKIE || 'r1-session';
const parsedSessionTtl = parseInt(process.env.AUTH_SESSION_TTL_SECONDS || '86400', 10);
const authSessionTtlSeconds = Number.isFinite(parsedSessionTtl) ? parsedSessionTtl : 86400;
const cstoreAuthHkey =
  process.env.R1EN_CSTORE_AUTH_HKEY ||
  process.env.EE_CSTORE_AUTH_HKEY ||
  process.env.CSTORE_AUTH_HKEY;
const cstoreAuthSecret =
  process.env.R1EN_CSTORE_AUTH_SECRET ||
  process.env.EE_CSTORE_AUTH_SECRET ||
  process.env.CSTORE_AUTH_SECRET;

export const platformConfig = {
  DEBUG: rawDebug,
  cstoreApiUrl,
  r1fsApiUrl,
  chainstorePeers,
  casesHKey: process.env.RATIO1_CASES_HKEY || 'ratio1-asd-cases',
  jobsHKey: process.env.RATIO1_JOBS_HKEY || 'ratio1-asd-jobs',
  auth: {
    sessionCookieName: authSessionCookieName,
    sessionTtlSeconds: authSessionTtlSeconds,
    cstore: {
      hkey: cstoreAuthHkey,
      secret: cstoreAuthSecret
    }
  }
} as const;

export type PlatformConfig = typeof platformConfig;
