import { NextRequest, NextResponse } from 'next/server';
import { createRun, listRuns } from '@/lib/runs';

// POST /api/runs — Create a new run
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { problemId, language, timeLimitMinutes } = body as {
    problemId: string;
    language: string;
    timeLimitMinutes?: number;
  };

  if (!problemId || !language) {
    return NextResponse.json(
      { error: 'Missing required fields: problemId, language' },
      { status: 400 }
    );
  }

  try {
    const run = await createRun(problemId, language, timeLimitMinutes ?? 90);
    return NextResponse.json(run, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create run';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/runs — List all runs, optionally filtered by problemId
export async function GET(request: NextRequest) {
  const problemId = request.nextUrl.searchParams.get('problemId') || undefined;

  try {
    const runs = await listRuns(problemId);
    return NextResponse.json(runs);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list runs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
