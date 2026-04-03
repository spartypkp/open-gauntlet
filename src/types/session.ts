export interface Session {
  id: string;
  problemId: string;
  language: string;
  startedAt: number; // timestamp
  timeLimit: number; // seconds
  currentLevel: 1 | 2 | 3 | 4;
  completedLevels: number[];
  levelTimes: Record<number, number>; // level -> seconds spent
  code: string;
  submissions: Submission[];
}

export interface Submission {
  level: number;
  timestamp: number;
  code: string;
  results: TestResult[];
  passed: boolean;
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  hidden: boolean;
  mismatchIndex?: number;
  mismatchExpected?: string;
  mismatchActual?: string;
  mismatchOperation?: (string | number | boolean | null)[];
  stdout?: string;
}
