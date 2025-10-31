import { CStoreAuth, resolveAuthEnv } from '@ratio1/cstore-auth-ts';

import { platformConfig } from '@/lib/config';

type AuthOverrides = Partial<Record<'hkey' | 'secret', string>>;

const overrides: AuthOverrides = {};

if (platformConfig.auth.cstore.hkey) {
  overrides.hkey = platformConfig.auth.cstore.hkey;
}

if (platformConfig.auth.cstore.secret) {
  overrides.secret = platformConfig.auth.cstore.secret;
}

let authClient: CStoreAuth | null = null;
let authInitPromise: Promise<void> | null = null;

export function getAuthClient(): CStoreAuth {
  if (!authClient) {
    const resolved = resolveAuthEnv(overrides, process.env);

    authClient = new CStoreAuth({
      hkey: resolved.hkey,
      secret: resolved.secret,
      logger: console
    });
  }

  return authClient;
}

export async function ensureAuthInitialized(client: CStoreAuth = getAuthClient()): Promise<void> {
  if (!authInitPromise) {
    authInitPromise = client.simple.init().catch((error) => {
      authInitPromise = null;
      throw error;
    });
  }

  await authInitPromise;
}
