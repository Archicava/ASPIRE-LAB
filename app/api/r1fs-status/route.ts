import { NextResponse } from 'next/server';

import { loadPlatformStatus } from '@/lib/data-platform';

export async function GET() {
  try {
    const status = await loadPlatformStatus();

    if (!status.r1fs) {
      return NextResponse.json({ error: 'R1FS status unavailable' }, { status: 503 });
    }

    return NextResponse.json(status.r1fs);
  } catch (error) {
    console.error('[r1fs-status] Failed to fetch Ratio1 filesystem status', error);
    return NextResponse.json({ error: 'Failed to fetch R1FS status' }, { status: 500 });
  }
}

