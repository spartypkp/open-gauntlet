import { NextRequest, NextResponse } from 'next/server';
import type { TestResult } from '@/types';
import { execute, getExtension } from '@/lib/executor';
import { getRun, saveCode, writeHarness, getRunDir } from '@/lib/runs';
import { getProblemById } from '@/lib/problems';
import { generatePythonHarness, parseHarnessOutput } from '@/lib/harness';

/**
 * POST /api/run — Run visible tests only (no hidden tests, no submission record).
 * This is the "Run Code" button — lets users iterate before submitting.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { runId, code, level } = body as { runId: string; code: string; level?: number };

  if (!runId || !code) {
    return NextResponse.json(
      { error: 'Missing required fields: runId, code' },
      { status: 400 }
    );
  }

  const run = await getRun(runId);
  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  const problem = getProblemById(run.problemId);
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  const currentLevel = level || run.currentLevel || 1;
  const levelData = problem.levels.find((l) => l.level === currentLevel);
  if (!levelData) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  try {
    // Write code to disk
    await saveCode(runId, code, run.language);

    // Run this level's visible tests only (matches real CodeSignal ICF behavior)
    const visibleTests = levelData.testCases.visible;

    if (run.language === 'python') {
      const harnessContent = generatePythonHarness(problem.className, visibleTests, false);
      await writeHarness(runId, harnessContent, run.language);
    } else {
      throw new Error(`Unsupported language: ${run.language}`);
    }

    const ext = getExtension(run.language);
    const result = await execute(run.language, `harness.${ext}`, getRunDir(runId));

    // Extract user stdout (before harness marker)
    const markerIdx = result.stdout.indexOf('__HARNESS_RESULT__');
    const userStdout = markerIdx >= 0 ? result.stdout.slice(0, markerIdx) : result.stdout;

    const harnessResults = parseHarnessOutput(result.stdout);

    if (!harnessResults) {
      return NextResponse.json({
        stdout: userStdout,
        stderr: result.stderr || 'Could not run tests. Check for syntax or runtime errors.',
        exitCode: result.exitCode,
        executionTime: result.executionTime,
        timedOut: result.timedOut,
        results: null,
      });
    }

    // Map results (all visible, no hidden masking needed)
    const results: TestResult[] = harnessResults.map((r) => ({
      name: r.name,
      passed: r.passed,
      expected: r.expected,
      actual: r.actual,
      hidden: false,
      mismatchIndex: r.mismatch_index,
      mismatchExpected: r.mismatch_expected,
      mismatchActual: r.mismatch_actual,
      mismatchOperation: r.mismatch_operation,
      stdout: r.stdout,
    }));

    return NextResponse.json({
      stdout: userStdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTime: result.executionTime,
      timedOut: result.timedOut,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Execution failed';
    return NextResponse.json(
      { error: message, stdout: '', stderr: message, exitCode: 1, executionTime: 0, timedOut: false, results: null },
      { status: 500 }
    );
  }
}
