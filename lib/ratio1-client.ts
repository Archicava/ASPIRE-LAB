import createEdgeSdk from '@ratio1/edge-sdk-ts';
import { createEdgeSdkBrowserClient } from '@ratio1/edge-sdk-ts/browser';
import FormDataNode from 'form-data';
import crossFetch from 'cross-fetch';

import { platformConfig } from '@/lib/config';

const sharedOptions = {
  cstoreUrl: platformConfig.cstoreApiUrl,
  r1fsUrl: platformConfig.r1fsApiUrl,
  chainstorePeers: platformConfig.chainstorePeers,
  debug: platformConfig.DEBUG,
  verbose: platformConfig.DEBUG
} as const;

const nodeHttpAdapter = {
  fetch: (url: string, options?: RequestInit) => crossFetch(url, options as any)
};

type NodeClient = ReturnType<typeof createEdgeSdk>;
type BrowserClient = ReturnType<typeof createEdgeSdkBrowserClient>;

type GlobalWithRatio1 = typeof globalThis & {
  __ratio1NodeClient?: NodeClient;
};

const globalWithRatio1 = globalThis as GlobalWithRatio1;

function createNodeClient(): NodeClient {
  return createEdgeSdk({
    ...sharedOptions,
    httpAdapter: nodeHttpAdapter,
    formDataCtor: FormDataNode as unknown as typeof FormData
  });
}

function createBrowserClient(): BrowserClient {
  return createEdgeSdkBrowserClient(sharedOptions);
}

export function getRatio1NodeClient(): NodeClient {
  if (typeof window !== 'undefined') {
    throw new Error('getRatio1NodeClient must only be used on the server');
  }

  if (!globalWithRatio1.__ratio1NodeClient) {
    globalWithRatio1.__ratio1NodeClient = createNodeClient();

    if (platformConfig.DEBUG) {
      console.log('[ratio1] Node client initialised', {
        cstoreUrl: sharedOptions.cstoreUrl,
        r1fsUrl: sharedOptions.r1fsUrl,
        peers: sharedOptions.chainstorePeers,
        mockMode: platformConfig.MOCK_MODE
      });
    }
  }

  return globalWithRatio1.__ratio1NodeClient;
}

export function getRatio1Client(): NodeClient | BrowserClient {
  return typeof window === 'undefined' ? getRatio1NodeClient() : createBrowserClient();
}
