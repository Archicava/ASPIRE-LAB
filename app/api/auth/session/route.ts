import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { platformConfig } from '@/lib/config';
import { readSessionFromCookie } from '@/lib/auth/session';

type SessionSuccess = {
  authenticated: true;
  user: {
    username: string;
    role?: string;
    metadata?: Record<string, unknown>;
  };
};

type SessionFailure = {
  authenticated: false;
};

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(platformConfig.auth.sessionCookieName)?.value;
  const session = readSessionFromCookie(sessionCookie);

  if (!session) {
    return NextResponse.json<SessionFailure>({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json<SessionSuccess>({
    authenticated: true,
    user: {
      username: session.username,
      role: session.role,
      metadata: session.metadata
    }
  });
}

export const runtime = 'nodejs';
