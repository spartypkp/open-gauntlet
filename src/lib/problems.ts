import fs from 'fs';
import path from 'path';
import type { Problem, ProblemLevel, TestSuite, TestCase } from '@/types';

const PROBLEMS_DIR = path.join(process.cwd(), 'problems');
const isDev = process.env.NODE_ENV === 'development';

let cachedProblems: Problem[] | null = null;

interface MetaJson {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  time_limit_minutes: number;
  languages: string[];
  class_name: string;
}

/**
 * Validate a test case has the correct shape.
 */
function validateTestCase(tc: unknown, problemId: string, level: number, index: number): TestCase {
  const t = tc as Record<string, unknown>;
  if (!t.name || typeof t.name !== 'string') {
    throw new Error(`Problem ${problemId} L${level} test ${index}: missing or invalid 'name'`);
  }
  if (!Array.isArray(t.operations) || t.operations.length === 0) {
    throw new Error(`Problem ${problemId} L${level} test "${t.name}": missing or empty 'operations'`);
  }
  if (!Array.isArray(t.expected)) {
    throw new Error(`Problem ${problemId} L${level} test "${t.name}": missing 'expected' array`);
  }
  if (t.operations.length !== t.expected.length) {
    throw new Error(
      `Problem ${problemId} L${level} test "${t.name}": operations (${t.operations.length}) and expected (${(t.expected as unknown[]).length}) length mismatch`
    );
  }
  return t as unknown as TestCase;
}

/**
 * Validate a test suite has visible and hidden arrays.
 */
function validateTestSuite(data: unknown, problemId: string, level: number): TestSuite {
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.visible)) {
    throw new Error(`Problem ${problemId} L${level}: test file missing 'visible' array`);
  }
  if (!Array.isArray(d.hidden)) {
    throw new Error(`Problem ${problemId} L${level}: test file missing 'hidden' array`);
  }
  return {
    visible: d.visible.map((tc, i) => validateTestCase(tc, problemId, level, i)),
    hidden: d.hidden.map((tc, i) => validateTestCase(tc, problemId, level, i)),
  };
}

const LANG_EXTENSIONS: Record<string, string> = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
};

function loadStarterCode(dir: string, languages: string[]): Record<string, string> {
  const starterCode: Record<string, string> = {};
  for (const lang of languages) {
    const ext = LANG_EXTENSIONS[lang] || lang;
    const starterPath = path.join(dir, `starter.${ext}`);
    if (fs.existsSync(starterPath)) {
      starterCode[lang] = fs.readFileSync(starterPath, 'utf-8');
    }
  }
  return starterCode;
}

function loadProblem(dir: string): Problem {
  const id = path.basename(dir);
  const meta: MetaJson = JSON.parse(
    fs.readFileSync(path.join(dir, 'meta.json'), 'utf-8')
  );

  const levels: ProblemLevel[] = [];
  for (let level = 1; level <= 4; level++) {
    const mdPath = path.join(dir, `level-${level}.md`);
    const testPath = path.join(dir, `level-${level}.test.json`);

    if (!fs.existsSync(mdPath) || !fs.existsSync(testPath)) break;

    const description = fs.readFileSync(mdPath, 'utf-8');
    const rawTestData = JSON.parse(fs.readFileSync(testPath, 'utf-8'));
    const testSuite = validateTestSuite(rawTestData, id, level);

    // Extract title from markdown heading (e.g. "# Level 1: Basic Routing" -> "Basic Routing")
    const headingMatch = description.match(/^#\s+Level\s+\d+:\s*(.+)/m);
    const levelTitle = headingMatch ? headingMatch[1].trim() : `Level ${level}`;

    // Extract summary: first non-empty line after the heading
    const lines = description.split('\n');
    const headingIdx = lines.findIndex((l) => /^#\s+Level\s+\d+/.test(l));
    let summary = '';
    if (headingIdx >= 0) {
      for (let j = headingIdx + 1; j < lines.length; j++) {
        const trimmed = lines[j].trim();
        if (trimmed && !trimmed.startsWith('#')) {
          summary = trimmed;
          break;
        }
      }
    }

    levels.push({
      level: level as 1 | 2 | 3 | 4,
      title: levelTitle,
      summary,
      description,
      testCases: testSuite,
    });
  }

  // Extract description from problem.md (first non-empty, non-heading line)
  let description = '';
  const problemMdPath = path.join(dir, 'problem.md');
  if (fs.existsSync(problemMdPath)) {
    const problemMd = fs.readFileSync(problemMdPath, 'utf-8');
    const mdLines = problemMd.split('\n');
    for (const line of mdLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        description = trimmed;
        break;
      }
    }
  }

  return {
    id,
    title: meta.title,
    description,
    difficulty: meta.difficulty,
    tags: meta.tags,
    className: meta.class_name,
    timeLimit: meta.time_limit_minutes,
    languages: meta.languages,
    starterCode: loadStarterCode(dir, meta.languages),
    levels,
  };
}

export function loadAllProblems(): Problem[] {
  // In development, skip cache so problem edits are picked up without restart
  if (cachedProblems && !isDev) return cachedProblems;

  const entries = fs.readdirSync(PROBLEMS_DIR, { withFileTypes: true });
  const problems: Problem[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_')) continue; // skip _template

    const problemDir = path.join(PROBLEMS_DIR, entry.name);
    const metaPath = path.join(problemDir, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;

    try {
      problems.push(loadProblem(problemDir));
    } catch (err) {
      console.error(`Failed to load problem ${entry.name}:`, err);
    }
  }

  cachedProblems = problems;
  return problems;
}

export function getProblemById(id: string): Problem | undefined {
  return loadAllProblems().find((p) => p.id === id);
}

/**
 * Strip hidden test cases and test case details from problem list responses.
 */
export function stripTestCases(problem: Problem): Problem {
  return {
    ...problem,
    levels: problem.levels.map((level) => ({
      ...level,
      testCases: { visible: [], hidden: [] },
    })),
  };
}

/**
 * Strip hidden test cases but keep visible ones (for single problem view).
 */
export function stripHiddenTests(problem: Problem): Problem {
  return {
    ...problem,
    levels: problem.levels.map((level) => ({
      ...level,
      testCases: {
        visible: level.testCases.visible,
        hidden: [], // hide hidden tests from client
      },
    })),
  };
}

export function getSolutionCode(problemId: string, level: number): string | null {
  const solutionPath = path.join(PROBLEMS_DIR, problemId, 'solutions', `level-${level}.py`);
  if (!fs.existsSync(solutionPath)) return null;
  return fs.readFileSync(solutionPath, 'utf-8');
}
