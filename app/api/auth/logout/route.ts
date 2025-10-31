import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/auth/session';

type LogoutResponse = {
  success: boolean;
};

export async function POST() {
  const response = NextResponse.json<LogoutResponse>({ success: true });
  const cookie = clearSessionCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.attributes);
  return response;
}

export const runtime = 'nodejs';
