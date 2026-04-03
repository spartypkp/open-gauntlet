import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Language runtime configuration
interface LanguageConfig {
  extension: string;
  // Ordered list of binary candidates to try
  candidates: string[];
  // Resolved binary path (set after detection)
  binary?: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  python: {
    extension: 'py',
    candidates: ['python3', 'python', 'py'],
  },
  javascript: {
    extension: 'js',
    candidates: ['node'],
  },
};

// Cache detected binaries so we only probe once
const resolvedBinaries: Record<string, string> = {};

/**
 * Detect the correct binary for a language by trying candidates with --version.
 * Caches result after first successful detection.
 */
export async function detectRuntime(language: string): Promise<string> {
  if (resolvedBinaries[language]) {
    return resolvedBinaries[language];
  }

  const config = LANGUAGE_CONFIGS[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  for (const candidate of config.candidates) {
    try {
      const { stdout } = await execFileAsync(candidate, ['--version'], {
        timeout: 5000,
      });
      // Guard against Windows Microsoft Store stub (returns empty or opens Store)
      if (stdout && stdout.trim().length > 0) {
        resolvedBinaries[language] = candidate;
        return candidate;
      }
    } catch {
      // This candidate doesn't work, try next
    }
  }

  throw new Error(
    `Could not find ${language} runtime. Tried: ${config.candidates.join(', ')}. ` +
    `Make sure ${language} is installed and on your PATH.`
  );
}

/**
 * Get the file extension for a language.
 */
export function getExtension(language: string): string {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);
  return config.extension;
}

/**
 * Get list of supported languages.
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_CONFIGS);
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  timedOut: boolean;
}

/**
 * Execute a file using the appropriate language runtime.
 * Runs in the given working directory.
 */
export async function execute(
  language: string,
  filePath: string,
  cwd: string,
  timeoutMs: number = 30000
): Promise<ExecuteResult> {
  const binary = await detectRuntime(language);
  const startTime = Date.now();

  const env = { ...process.env };

  // Python-specific: prevent output buffering
  if (language === 'python') {
    env.PYTHONUNBUFFERED = '1';
    env.PYTHONDONTWRITEBYTECODE = '1';
  }

  try {
    const { stdout, stderr } = await execFileAsync(binary, [filePath], {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      env,
    });

    return {
      stdout,
      stderr,
      exitCode: 0,
      executionTime: Date.now() - startTime,
      timedOut: false,
    };
  } catch (err: unknown) {
    const execErr = err as {
      stdout?: string;
      stderr?: string;
      code?: number | string;
      killed?: boolean;
      signal?: string;
    };

    // execFile throws on non-zero exit, but stdout/stderr are still populated
    return {
      stdout: execErr.stdout || '',
      stderr: execErr.stderr || '',
      exitCode: typeof execErr.code === 'number' ? execErr.code : 1,
      executionTime: Date.now() - startTime,
      timedOut: execErr.killed === true || execErr.signal === 'SIGTERM',
    };
  }
}
