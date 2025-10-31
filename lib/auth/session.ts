import { platformConfig } from '@/lib/config';

export type SessionPayload = {
  username: string;
  issuedAt: number;
  role?: 'admin' | 'user' | string;
  metadata?: Record<string, unknown>;
};

export type SessionCookie = {
  name: string;
  value: string;
  attributes: {
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    secure: boolean;
    path: string;
    maxAge: number;
  };
};

const SESSION_TTL_SECONDS = platformConfig.auth.sessionTtlSeconds;

function encodeSession(payload: SessionPayload): string {
  return encodeURIComponent(JSON.stringify(payload));
}

function decodeSession(value: string | undefined): SessionPayload | null {
  if (!value) {
    return null;
  }

  try {
    const json = decodeURIComponent(value);
    const parsed = JSON.parse(json) as Partial<SessionPayload>;

    if (!parsed || typeof parsed.username !== 'string' || typeof parsed.issuedAt !== 'number') {
      return null;
    }

    let role: SessionPayload['role'];
    if (parsed.role !== undefined) {
      if (typeof parsed.role === 'string' && parsed.role.trim().length > 0) {
        role = parsed.role;
      } else {
        return null;
      }
    }

    let metadata: Record<string, unknown> | undefined;
    if (parsed.metadata !== undefined) {
      if (typeof parsed.metadata === 'object' && parsed.metadata !== null && !Array.isArray(parsed.metadata)) {
        metadata = parsed.metadata as Record<string, unknown>;
      } else {
        metadata = undefined;
      }
    }

    return {
      username: parsed.username,
      issuedAt: parsed.issuedAt,
      ...(role ? { role } : {}),
      ...(metadata ? { metadata } : {})
    };
  } catch (error) {
    console.warn('[auth] Failed to decode session cookie', error);
    return null;
  }
}

export function isSessionExpired(payload: SessionPayload, now: number = Date.now()): boolean {
  const ageSeconds = Math.floor(now / 1000) - payload.issuedAt;
  return ageSeconds > SESSION_TTL_SECONDS;
}

export function createSessionCookie({
  username,
  role,
  metadata
}: {
  username: string;
  role?: SessionPayload['role'];
  metadata?: SessionPayload['metadata'];
}): SessionCookie {
  const payload: SessionPayload = {
    username,
    issuedAt: Math.floor(Date.now() / 1000),
    ...(role ? { role } : {}),
    ...(metadata ? { metadata } : {})
  };

  const value = encodeSession(payload);

  return {
    name: platformConfig.auth.sessionCookieName,
    value,
    attributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: SESSION_TTL_SECONDS
    }
  };
}

export function clearSessionCookie(): SessionCookie {
  return {
    name: platformConfig.auth.sessionCookieName,
    value: '',
    attributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: 0
    }
  };
}

export function readSessionFromCookie(
  value: string | undefined,
  now: number = Date.now()
): SessionPayload | null {
  const payload = decodeSession(value);
  if (!payload) {
    return null;
  }

  if (isSessionExpired(payload, now)) {
    return null;
  }

  return payload;
}
