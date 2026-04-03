import { NextRequest, NextResponse } from 'next/server';
import { getRun, saveCode } from '@/lib/runs';

// POST /api/save — Write code to disk (called by Monaco debounced sync)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { runId, code } = body as { runId: string; code: string };

  if (!runId || code === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: runId, code' },
      { status: 400 }
    );
  }

  const run = await getRun(runId);
  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  try {
    await saveCode(runId, code, run.language);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
