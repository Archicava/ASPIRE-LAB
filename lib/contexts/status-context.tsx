'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { apiService } from '@/lib/services/api-service';

type StatusValue = Record<string, unknown> | null;

type StatusContextValue = {
  r1fsStatus: StatusValue;
  cstoreStatus: StatusValue;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const StatusContext = createContext<StatusContextValue | undefined>(undefined);

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [r1fsStatus, setR1FSStatus] = useState<StatusValue>(null);
  const [cstoreStatus, setCStoreStatus] = useState<StatusValue>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [r1fsResult, cstoreResult] = await Promise.allSettled([
      apiService.getR1FSStatus(),
      apiService.getCStoreStatus()
    ]);

    if (r1fsResult.status === 'fulfilled') {
      setR1FSStatus(r1fsResult.value as StatusValue);
    } else {
      setR1FSStatus(null);
      setError((prev) => prev ?? 'Unable to reach R1FS service');
    }

    if (cstoreResult.status === 'fulfilled') {
      setCStoreStatus(cstoreResult.value as StatusValue);
    } else {
      setCStoreStatus(null);
      setError((prev) => prev ?? 'Unable to reach CStore service');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus().catch((err) => {
      console.error('[StatusProvider] initial fetch failed', err);
    });
  }, [fetchStatus]);

  const value = useMemo<StatusContextValue>(
    () => ({
      r1fsStatus,
      cstoreStatus,
      isLoading,
      error,
      refresh: fetchStatus
    }),
    [r1fsStatus, cstoreStatus, isLoading, error, fetchStatus]
  );

  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
}

export function useStatus(): StatusContextValue {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
}

