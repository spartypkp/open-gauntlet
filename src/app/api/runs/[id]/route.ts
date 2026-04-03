import { NextRequest, NextResponse } from 'next/server';
import { getRun, updateRun, deleteRun, listSubmissions, calculateScore, readCode } from '@/lib/runs';
import { getProblemById } from '@/lib/problems';

// GET /api/runs/{id} — Get run details + submissions + computed score
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const run = await getRun(id);

  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  const submissions = await listSubmissions(id);
  const savedCode = await readCode(id, run.language);

  // Compute score on the fly from submissions
  const problem = getProblemById(run.problemId);
  const totalLevels = problem?.levels.length ?? 4;
  const score = await calculateScore(id, totalLevels);

  return NextResponse.json({ ...run, submissions, score, savedCode });
}

// DELETE /api/runs/{id} — Delete a run
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const run = await getRun(id);

  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  try {
    await deleteRun(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete run';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/runs/{id} — Update run metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();

  try {
    const updated = await updateRun(id, updates);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update run';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
