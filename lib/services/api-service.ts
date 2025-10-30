'use client';

class ApiService {
  private async request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {})
      },
      cache: 'no-store',
      ...init
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = (errorBody as { error?: string }).error ?? response.statusText;
      throw new Error(`${endpoint} failed: ${message}`);
    }

    return response.json() as Promise<T>;
  }

  async getR1FSStatus(): Promise<unknown> {
    return this.request('/api/r1fs-status');
  }

  async getCStoreStatus(): Promise<unknown> {
    return this.request('/api/cstore-status');
  }
}

export const apiService = new ApiService();

