import { NextRequest, NextResponse } from 'next/server';

import { loadCaseRecords, storeCaseSubmission } from '@/lib/data-platform';
import { CaseSubmission } from '@/lib/types';

export async function GET() {
  try {
    const cases = await loadCaseRecords();
    return NextResponse.json(cases);
  } catch (error) {
    console.error('[cases] Failed to load cases', error);
    return NextResponse.json({ error: 'Failed to load cases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const submission = (await request.json()) as CaseSubmission;
    const record = await storeCaseSubmission(submission);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('[cases] Failed to store case submission', error);
    return NextResponse.json({ error: 'Failed to submit case' }, { status: 500 });
  }
}

