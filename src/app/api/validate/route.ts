import { NextRequest, NextResponse } from 'next/server';
import type { ValidateResponse, TestResult } from '@/types';
import { execute, getExtension } from '@/lib/executor';
import { getRun, updateRun, saveCode, writeHarness, getRunDir, saveSubmission, countLevelSubmissions } from '@/lib/runs';
import type { SubmissionRecord } from '@/lib/runs';
import { getProblemById } from '@/lib/problems';
import { generatePythonHarness, parseHarnessOutput } from '@/lib/harness';

function generateHarness(
  language: string,
  className: string,
  allTests: import('@/types').TestCase[]
): string {
  if (language === 'python') {
    return generatePythonHarness(className, allTests, true);
  }
  throw new Error(`Unsupported language: ${language}`);
}

export async function POST(request: NextRequest) {
  let body: { runId: string; code: string; level: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { runId, code, level } = body;
  if (!runId || !code || !level) {
    return NextResponse.json(
      { error: 'Missing required fields: runId, code, level' },
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

  const levelData = problem.levels.find((l) => l.level === level);
  if (!levelData) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  // Run only this level's tests (matches real CodeSignal ICF behavior).
  // Each level's test cases invoke prior-level operations as setup,
  // so backwards compat is tested implicitly through usage, not re-grading.
  const visibleTests: import('@/types').TestCase[] = [...levelData.testCases.visible];
  const hiddenTests: import('@/types').TestCase[] = [...levelData.testCases.hidden];
  const allTests = [...visibleTests, ...hiddenTests];
  const visibleCount = visibleTests.length;

  try {
    // Write code and harness to disk
    await saveCode(runId, code, run.language);
    const harnessContent = generateHarness(run.language, problem.className, allTests);
    await writeHarness(runId, harnessContent, run.language);

    // Execute harness (which imports solution)
    const ext = getExtension(run.language);
    const result = await execute(run.language, `harness.${ext}`, getRunDir(runId));

    // Extract user stdout (before harness marker)
    const markerIdx = result.stdout.indexOf('__HARNESS_RESULT__');
    const userStdout = markerIdx >= 0 ? result.stdout.slice(0, markerIdx) : result.stdout;

    const harnessResults = parseHarnessOutput(result.stdout);

    if (!harnessResults) {
      const response: ValidateResponse = {
        passed: false,
        results: [],
        stdout: userStdout,
        stderr: result.stderr || 'Harness did not produce results. Check for syntax or runtime errors.',
      };
      return NextResponse.json(response);
    }

    // Map results, marking hidden tests
    const results: TestResult[] = harnessResults.map((r) => {
      const isHidden = r.index >= visibleCount;
      return {
        name: r.name,
        passed: r.passed,
        expected: isHidden ? '' : r.expected,
        actual: isHidden ? '' : r.actual,
        hidden: isHidden,
        mismatchIndex: r.mismatch_index,
        mismatchExpected: isHidden && r.passed ? undefined : r.mismatch_expected,
        mismatchActual: isHidden && r.passed ? undefined : r.mismatch_actual,
        mismatchOperation: r.mismatch_operation,
        stdout: r.stdout,
      };
    });

    const allPassed = results.every((r) => r.passed);

    // Save submission record
    const submissionCount = await countLevelSubmissions(runId, level);
    const submissionId = `${String(submissionCount + 1).padStart(3, '0')}-L${level}-${allPassed ? 'pass' : 'fail'}`;
    const submission: SubmissionRecord = {
      id: submissionId,
      level,
      timestamp: Date.now(),
      passed: allPassed,
      results,
      codeSnapshot: code,
    };
    await saveSubmission(runId, submission);

    // Update run metadata when a level passes
    if (allPassed) {
      const completedLevels = [...new Set([...run.completedLevels, level])];
      const maxLevel = problem.levels.length;
      const now = Date.now();
      const levelTimes: Record<string, number> = { ...(run.levelTimes || {}) };
      if (!levelTimes[String(level)] && run.startedAt) {
        levelTimes[String(level)] = Math.round((now - run.startedAt) / 1000);
      }
      const finished = level === maxLevel;
      await updateRun(runId, {
        completedLevels,
        levelTimes: levelTimes as Record<number, number>,
        status: finished ? 'finished' : run.status,
        // Don't update currentLevel here — client controls via NEXT button
      });
    }

    const response: ValidateResponse = {
      passed: allPassed,
      results,
      stdout: userStdout,
      stderr: result.stderr,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed';
    return NextResponse.json(
      { error: message, passed: false, results: [], stdout: '', stderr: message },
      { status: 500 }
    );
  }
}
