import type { TestResult } from './session';

export interface RunRequest {
  code: string;
  language: string;
}

export interface RunResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  results?: TestResult[] | null;
}

export interface ValidateRequest {
  code: string;
  language: string;
  problemId: string;
  level: number;
}

export interface ValidateResponse {
  passed: boolean;
  results: TestResult[];
  stdout: string;
  stderr: string;
}
