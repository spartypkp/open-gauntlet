import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/executor';
import { getRun, saveCode, getRunDir } from '@/lib/runs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * POST /api/custom-run — Run custom test code against the user's solution.
 * Writes the user's solution as solution.py, then runs a custom_test.py
 * that imports from it. Returns raw stdout/stderr.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { runId, code, testCode } = body as { runId: string; code: string; testCode: string };

  if (!runId || !code || !testCode) {
    return NextResponse.json(
      { error: 'Missing required fields: runId, code, testCode' },
      { status: 400 }
    );
  }

  const run = await getRun(runId);
  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  try {
    // Write solution code
    await saveCode(runId, code, run.language);

    // Write custom test file
    const runDir = getRunDir(runId);
    await writeFile(path.join(runDir, 'custom_test.py'), testCode, 'utf-8');

    // Execute custom test
    const result = await execute(run.language, 'custom_test.py', runDir);

    return NextResponse.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTime: result.executionTime,
      timedOut: result.timedOut,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Execution failed';
    return NextResponse.json(
      { error: message, stdout: '', stderr: message, exitCode: 1, executionTime: 0, timedOut: false },
      { status: 500 }
    );
  }
}
