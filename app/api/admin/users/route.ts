import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { readSessionFromCookie } from '@/lib/auth/session';
import { platformConfig } from '@/lib/config';
import {
  addMockUser,
  listMockUsers,
  MockUserExistsError,
  MockUserValidationError
} from '@/lib/mock-users';

type UsersSuccess = {
  mode: 'mock';
  users: ReturnType<typeof listMockUsers>;
};

type UserCreated = {
  mode: 'mock';
  user: ReturnType<typeof listMockUsers>[number];
};

type ErrorPayload = {
  error: string;
  mode?: 'live';
};

async function ensureAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(platformConfig.auth.sessionCookieName)?.value;
  const session = readSessionFromCookie(sessionCookie);
  return session?.role === 'admin';
}

export async function GET() {
  if (!(await ensureAdminSession())) {
    return NextResponse.json<ErrorPayload>({ error: 'Admin access required.' }, { status: 403 });
  }

  if (!platformConfig.useMocks) {
    return NextResponse.json<ErrorPayload>(
      { error: 'User management is only available in mock mode.', mode: 'live' },
      { status: 501 }
    );
  }

  return NextResponse.json<UsersSuccess>({ mode: 'mock', users: listMockUsers() });
}

export async function POST(request: Request) {
  if (!(await ensureAdminSession())) {
    return NextResponse.json<ErrorPayload>({ error: 'Admin access required.' }, { status: 403 });
  }

  if (!platformConfig.useMocks) {
    return NextResponse.json<ErrorPayload>(
      { error: 'User management is only available in mock mode.', mode: 'live' },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json<ErrorPayload>({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { username, password, role, displayName } = body as {
    username?: unknown;
    password?: unknown;
    role?: unknown;
    displayName?: unknown;
  };

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json<ErrorPayload>({ error: 'Username and password are required.' }, { status: 400 });
  }

  try {
    const user = addMockUser({
      username,
      password,
      role: typeof role === 'string' ? role : undefined,
      displayName: typeof displayName === 'string' ? displayName : undefined
    });

    return NextResponse.json<UserCreated>({ mode: 'mock', user }, { status: 201 });
  } catch (error) {
    if (error instanceof MockUserExistsError) {
      return NextResponse.json<ErrorPayload>({ error: error.message }, { status: 409 });
    }
    if (error instanceof MockUserValidationError) {
      return NextResponse.json<ErrorPayload>({ error: error.message }, { status: 400 });
    }

    console.error('[admin] Failed to create user', error);
    return NextResponse.json<ErrorPayload>({ error: 'Failed to create user.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
