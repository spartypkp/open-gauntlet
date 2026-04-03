export interface Problem {
  id: string;
  title: string;
  description: string; // from problem.md first content line
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  className: string;
  timeLimit: number; // minutes
  languages: string[];
  starterCode: Record<string, string>;
  levels: ProblemLevel[];
}

export interface ProblemLevel {
  level: 1 | 2 | 3 | 4;
  title: string;
  summary: string; // first line after heading
  description: string; // markdown
  testCases: TestSuite;
}

export interface TestSuite {
  visible: TestCase[];
  hidden: TestCase[];
}

export interface TestCase {
  name: string;
  operations: (string | number | boolean | null)[][];
  expected: string[];
}
