import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { getExtension } from './executor';

// All user data lives here
const DATA_DIR = path.join(os.homedir(), '.open-gauntlet');
const RUNS_DIR = path.join(DATA_DIR, 'runs');

/**
 * Run metadata stored in run.json
 */
export interface RunMeta {
  id: string;
  problemId: string;
  language: string;
  createdAt: number;     // timestamp
  startedAt: number | null;  // when timer started
  timeLimit: number;     // seconds
  currentLevel: number;
  completedLevels: number[];
  levelTimes: Record<number, number>;
  status: 'setup' | 'active' | 'paused' | 'expired' | 'finished';
  score: RunScore | null;
  elapsedAtPause: number | null;
}

export interface RunScore {
  levelsCompleted: number;
  totalLevels: number;
  totalTime: number;       // seconds used
  levelResults: LevelScore[];
}

export interface LevelScore {
  level: number;
  passed: boolean;
  submissions: number;     // how many attempts
  timeSpent: number;       // seconds on this level
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
}

export interface SubmissionRecord {
  id: string;              // e.g. "001-L1-pass"
  level: number;
  timestamp: number;
  passed: boolean;
  results: {
    name: string;
    passed: boolean;
    expected: string;
    actual: string;
    hidden: boolean;
  }[];
  codeSnapshot: string;    // code at time of submission
}

/**
 * Ensure the data directories exist.
 */
async function ensureDirs(): Promise<void> {
  await fs.mkdir(RUNS_DIR, { recursive: true });
}

/**
 * Get the directory path for a run.
 */
function runDir(runId: string): string {
  return path.join(RUNS_DIR, runId);
}

/**
 * Create a new run. Returns the run metadata.
 */
export async function createRun(
  problemId: string,
  language: string,
  timeLimitMinutes: number = 90
): Promise<RunMeta> {
  await ensureDirs();

  const id = crypto.randomUUID();
  const dir = runDir(id);
  await fs.mkdir(dir);
  await fs.mkdir(path.join(dir, 'submissions'));

  const meta: RunMeta = {
    id,
    problemId,
    language,
    createdAt: Date.now(),
    startedAt: null,
    timeLimit: timeLimitMinutes * 60,
    currentLevel: 1,
    completedLevels: [],
    levelTimes: {},
    status: 'setup',
    score: null,
    elapsedAtPause: null,
  };

  await fs.writeFile(path.join(dir, 'run.json'), JSON.stringify(meta, null, 2));
  return meta;
}

/**
 * Get run metadata.
 */
export async function getRun(runId: string): Promise<RunMeta | null> {
  try {
    const data = await fs.readFile(path.join(runDir(runId), 'run.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Update run metadata (partial update, merges with existing).
 */
export async function updateRun(runId: string, updates: Partial<RunMeta>): Promise<RunMeta> {
  const meta = await getRun(runId);
  if (!meta) throw new Error(`Run not found: ${runId}`);

  const updated = { ...meta, ...updates };
  await fs.writeFile(
    path.join(runDir(runId), 'run.json'),
    JSON.stringify(updated, null, 2)
  );
  return updated;
}

/**
 * List all runs, optionally filtered by problemId. Most recent first.
 */
export async function listRuns(problemId?: string): Promise<RunMeta[]> {
  await ensureDirs();

  try {
    const entries = await fs.readdir(RUNS_DIR, { withFileTypes: true });
    const runs: RunMeta[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const meta = await getRun(entry.name);
      if (meta && (!problemId || meta.problemId === problemId)) {
        runs.push(meta);
      }
    }

    // Most recent first
    runs.sort((a, b) => b.createdAt - a.createdAt);
    return runs;
  } catch {
    return [];
  }
}

/**
 * Write the user's code to the solution file in the run directory.
 */
export async function saveCode(runId: string, code: string, language: string): Promise<void> {
  const ext = getExtension(language);
  const filePath = path.join(runDir(runId), `solution.${ext}`);
  await fs.writeFile(filePath, code, 'utf-8');
}

/**
 * Read the user's code from the solution file.
 */
export async function readCode(runId: string, language: string): Promise<string | null> {
  const ext = getExtension(language);
  const filePath = path.join(runDir(runId), `solution.${ext}`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Write a harness file to the run directory.
 */
export async function writeHarness(runId: string, content: string, language: string): Promise<string> {
  const ext = getExtension(language);
  const fileName = `harness.${ext}`;
  const filePath = path.join(runDir(runId), fileName);
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Save a submission record.
 */
export async function saveSubmission(runId: string, submission: SubmissionRecord): Promise<void> {
  const submissionsDir = path.join(runDir(runId), 'submissions');
  await fs.mkdir(submissionsDir, { recursive: true });

  const fileName = `${submission.id}.json`;
  await fs.writeFile(
    path.join(submissionsDir, fileName),
    JSON.stringify(submission, null, 2)
  );
}

/**
 * List all submissions for a run, ordered by timestamp.
 */
export async function listSubmissions(runId: string): Promise<SubmissionRecord[]> {
  const submissionsDir = path.join(runDir(runId), 'submissions');
  try {
    const files = await fs.readdir(submissionsDir);
    const submissions: SubmissionRecord[] = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const data = await fs.readFile(path.join(submissionsDir, file), 'utf-8');
      submissions.push(JSON.parse(data));
    }

    submissions.sort((a, b) => a.timestamp - b.timestamp);
    return submissions;
  } catch {
    return [];
  }
}

/**
 * Delete a run and all its files.
 */
export async function deleteRun(runId: string): Promise<void> {
  const dir = runDir(runId);
  await fs.rm(dir, { recursive: true, force: true });
}

/**
 * Get the solution file path for execution.
 */
export function getSolutionPath(runId: string, language: string): string {
  const ext = getExtension(language);
  return path.join(runDir(runId), `solution.${ext}`);
}

/**
 * Get the run directory path.
 */
export function getRunDir(runId: string): string {
  return runDir(runId);
}

/**
 * Count submissions for a specific level in a run.
 */
export async function countLevelSubmissions(runId: string, level: number): Promise<number> {
  const submissions = await listSubmissions(runId);
  return submissions.filter(s => s.level === level).length;
}

/**
 * Calculate the score for a completed run based on submissions and timing.
 *
 * Scoring model (v1 - simple auto-scoring):
 * - Base: 200 points per level completed (max 800 for 4 levels)
 * - Efficiency bonus: fewer submissions = higher score per level
 *   First try: +50, second try: +25, 3+: +0
 * - Speed bonus: completing under time limit percentage thresholds
 *   Under 50% time: +100, under 75%: +50, under 90%: +25
 * - Max possible: 800 (levels) + 200 (efficiency) + 100 (speed) = 1100
 * - Minimum: 0 (no levels completed)
 */
export async function calculateScore(runId: string, totalLevels: number): Promise<RunScore> {
  const run = await getRun(runId);
  if (!run) throw new Error(`Run not found: ${runId}`);

  const submissions = await listSubmissions(runId);
  const completedLevels = run.completedLevels || [];

  // Calculate total time used
  const totalTime = run.startedAt
    ? Math.round((Date.now() - run.startedAt) / 1000)
    : 0;

  const levelResults: LevelScore[] = [];

  for (let level = 1; level <= totalLevels; level++) {
    const levelSubs = submissions.filter(s => s.level === level);
    const passed = completedLevels.includes(level);
    const passingSub = levelSubs.find(s => s.passed);

    // Count visible/hidden from the last submission (or passing one)
    const relevantSub = passingSub || levelSubs[levelSubs.length - 1];
    let visiblePassed = 0, visibleTotal = 0, hiddenPassed = 0, hiddenTotal = 0;

    if (relevantSub) {
      const visible = relevantSub.results.filter(r => !r.hidden);
      const hidden = relevantSub.results.filter(r => r.hidden);
      visiblePassed = visible.filter(r => r.passed).length;
      visibleTotal = visible.length;
      hiddenPassed = hidden.filter(r => r.passed).length;
      hiddenTotal = hidden.length;
    }

    // Time spent on this level
    const timeSpent = (run.levelTimes as Record<string, number>)[String(level)] || 0;

    levelResults.push({
      level,
      passed,
      submissions: levelSubs.length,
      timeSpent,
      visiblePassed,
      visibleTotal,
      hiddenPassed,
      hiddenTotal,
    });
  }

  return {
    levelsCompleted: completedLevels.length,
    totalLevels,
    totalTime: Math.min(totalTime, run.timeLimit),
    levelResults,
  };
}
