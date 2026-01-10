import { NextResponse } from 'next/server';
import { InvalidCredentialsError, type PublicUser } from '@ratio1/cstore-auth-ts';

import { ensureAuthInitialized, getAuthClient } from '@/lib/auth/cstore';
import { createSessionCookie } from '@/lib/auth/session';
import { platformConfig } from '@/lib/config';
import { authenticateMockUser } from '@/lib/mock-users';

type AuthenticatedUser = PublicUser<Record<string, unknown>>;

type SuccessPayload = {
  success: true;
  token: string;
  user: {
    username: string;
    role?: string;
    metadata?: Record<string, unknown>;
  };
};

type ErrorPayload = {
  success: false;
  error: string;
};

async function authenticate(username: string, password: string): Promise<AuthenticatedUser> {
  if (platformConfig.useMocks) {
    return authenticateMockUser(username, password) as unknown as AuthenticatedUser;
  }

  const client = getAuthClient();

  await ensureAuthInitialized(client);

  return client.simple.authenticate(username, password);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ErrorPayload>({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json<ErrorPayload>({ success: false, error: 'Missing credentials' }, { status: 400 });
  }

  const { username, password } = body as { username?: unknown; password?: unknown };

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json<ErrorPayload>({ success: false, error: 'Username and password are required' }, { status: 400 });
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return NextResponse.json<ErrorPayload>({ success: false, error: 'Username and password cannot be empty' }, { status: 400 });
  }

  try {
    const user = await authenticate(trimmedUsername, trimmedPassword);
    const token = crypto.randomUUID();

    const response = NextResponse.json<SuccessPayload>({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role,
        metadata: user.metadata ?? undefined
      }
    });

    const sessionCookie = createSessionCookie({
      username: user.username,
      role: user.role,
      metadata: user.metadata ?? undefined
    });

    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json<ErrorPayload>({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    console.error('[auth] Login request failed', error);
    return NextResponse.json<ErrorPayload>({ success: false, error: 'Authentication service failure' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
