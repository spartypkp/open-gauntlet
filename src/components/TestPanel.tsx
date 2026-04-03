'use client';

import { useState, useCallback, useRef } from 'react';
import type { Problem, TestResult } from '@/types';

interface TestPanelProps {
  problem: Problem;
  currentLevel: number;
  testResults: TestResult[] | null;
  testResultsPassed: boolean | null;
  runOutput: { stdout: string; stderr: string } | null;
  onRun: () => void;
  isRunning: boolean;
  locked: boolean;
  executionTime: number | null;
  runId: string | null;
  code: string;
}

function reconstructOperations(operations: (string | number | boolean | null)[][], className: string): string {
  const varName = className.replace(/([A-Z])/g, (_, c: string, i: number) => (i === 0 ? c.toLowerCase() : '_' + c.toLowerCase())).replace(/^_/, '');
  const lines: string[] = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const method = op[0] as string;
    const args = op.slice(1);
    const isLast = i === operations.length - 1;
    const prefix = isLast ? 'result = ' : '';

    if (method === 'init') {
      lines.push(`${varName} = ${className}(${args.map(stringifyArg).join(', ')})`);
    } else {
      lines.push(`${prefix}${varName}.${method}(${args.map(stringifyArg).join(', ')})`);
    }
  }
  return lines.join('\n');
}

function stringifyArg(val: string | number | boolean | null): string {
  if (val === null) return 'None';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'boolean') return val ? 'True' : 'False';
  return String(val);
}

function formatOperation(op: (string | number | boolean | null)[], className: string): string {
  const method = op[0] as string;
  const args = op.slice(1);
  const varName = className.replace(/([A-Z])/g, (_, c: string, i: number) => (i === 0 ? c.toLowerCase() : '_' + c.toLowerCase())).replace(/^_/, '');
  if (method === 'init') {
    return `${varName} = ${className}(${args.map(stringifyArg).join(', ')})`;
  }
  return `${varName}.${method}(${args.map(stringifyArg).join(', ')})`;
}

function formatValue(raw: string | undefined): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'string' && parsed[0].startsWith('Error: ')) {
      return parsed[0];
    }
    return raw;
  } catch {
    return raw;
  }
}

export default function TestPanel({
  problem,
  currentLevel,
  testResults,
  testResultsPassed,
  runOutput,
  onRun,
  isRunning,
  locked,
  executionTime,
  runId,
  code,
}: TestPanelProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'tests' | 'custom'>('tests');
  const [customCode, setCustomCode] = useState(() =>
    `from solution import ${problem.className}\n\n# Write your test code here\nstore = ${problem.className}()\nprint(store)\n`
  );
  const [customOutput, setCustomOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [isRunningCustom, setIsRunningCustom] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Show this level's tests only (matches real CodeSignal ICF behavior)
  const currentLevelData = problem.levels.find((l) => l.level === currentLevel);
  const visibleTests = currentLevelData?.testCases.visible ?? [];
  const hiddenCount = currentLevelData?.testCases.hidden.length ?? 0;

  const toggleExpand = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const visibleResults = testResults?.filter((r) => !r.hidden) ?? [];
  const hiddenResults = testResults?.filter((r) => r.hidden) ?? [];
  const totalPassed = testResults?.filter((r) => r.passed).length ?? 0;
  const totalCount = testResults?.length ?? 0;

  const hasStderr = runOutput?.stderr && runOutput.stderr.trim().length > 0;

  const runCustom = useCallback(async () => {
    if (!runId || !code || isRunningCustom) return;
    setIsRunningCustom(true);
    setCustomOutput(null);
    try {
      const res = await fetch('/api/custom-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, code, testCode: customCode }),
      });
      const result = await res.json();
      setCustomOutput({ stdout: result.stdout || '', stderr: result.stderr || '' });
    } catch (err) {
      setCustomOutput({ stdout: '', stderr: String(err) });
    } finally {
      setIsRunningCustom(false);
    }
  }, [runId, code, customCode, isRunningCustom]);

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Header */}
      <div className="h-9 border-b border-border flex items-center shrink-0 px-3">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              activeTab === 'tests' ? 'text-foreground' : 'text-[#666] hover:text-[#999]'
            }`}
          >
            TESTS
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${
              activeTab === 'custom' ? 'text-foreground' : 'text-[#666] hover:text-[#999]'
            }`}
          >
            CUSTOM INPUT
          </button>
        </div>
        <div className="flex-1" />
        {activeTab === 'tests' ? (
          <button
            onClick={onRun}
            disabled={locked || isRunning}
            className="px-3 py-1 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Running
              </>
            ) : (
              <>
                Run Tests
                <kbd className="text-[9px] text-[#aaa] font-mono opacity-60">^&#9166;</kbd>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={runCustom}
            disabled={isRunningCustom}
            className="px-3 py-1 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {isRunningCustom ? (
              <>
                <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Running
              </>
            ) : (
              'Run Custom'
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'tests' ? (
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {hasStderr && (
            <pre className="whitespace-pre-wrap text-danger bg-danger/5 border border-danger/20 p-2.5 overflow-auto max-h-[30vh] font-mono text-xs">
              {runOutput!.stderr}
            </pre>
          )}

          {!testResults ? (
            <PreRunTests
              visibleTests={visibleTests}
              hiddenCount={hiddenCount}
              className={problem.className}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          ) : (
            <TestResults
              visibleResults={visibleResults}
              hiddenResults={hiddenResults}
              testResultsPassed={testResultsPassed}
              totalPassed={totalPassed}
              totalCount={totalCount}
              visibleTests={visibleTests}
              className={problem.className}
              expanded={expanded}
              toggleExpand={toggleExpand}
              executionTime={executionTime}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <textarea
            ref={textareaRef}
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runCustom();
              }
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const val = e.currentTarget.value;
                setCustomCode(val.substring(0, start) + '    ' + val.substring(end));
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                  }
                }, 0);
              }
            }}
            spellCheck={false}
            className="flex-1 min-h-[80px] p-3 font-mono text-xs bg-surface-0 text-foreground border-b border-border resize-none focus:outline-none"
            placeholder={`from solution import ${problem.className}\n\n# Write test code here...`}
          />
          {customOutput && (
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {customOutput.stdout && (
                <div>
                  <p className="text-[10px] font-mono text-[#666] uppercase mb-1">stdout</p>
                  <pre className="font-mono text-xs text-foreground/80 bg-surface-1 border border-border-subtle p-2 overflow-x-auto whitespace-pre-wrap">
                    {customOutput.stdout}
                  </pre>
                </div>
              )}
              {customOutput.stderr && (
                <div>
                  <p className="text-[10px] font-mono text-[#666] uppercase mb-1">stderr</p>
                  <pre className="font-mono text-xs text-danger bg-danger/5 border border-danger/20 p-2 overflow-x-auto whitespace-pre-wrap">
                    {customOutput.stderr}
                  </pre>
                </div>
              )}
              {!customOutput.stdout && !customOutput.stderr && (
                <div className="text-xs text-[#666] font-mono">No output</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreRunTests({
  visibleTests,
  hiddenCount,
  className,
  expanded,
  toggleExpand,
}: {
  visibleTests: import('@/types').TestCase[];
  hiddenCount: number;
  className: string;
  expanded: Set<number>;
  toggleExpand: (i: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-[#666] px-2 mb-2">
        {visibleTests.length} visible test{visibleTests.length !== 1 ? 's' : ''}, {hiddenCount} hidden test{hiddenCount !== 1 ? 's' : ''}
      </div>
      {visibleTests.map((tc, i) => {
        const isExpanded = expanded.has(i);
        return (
          <div key={i} className="border border-border-subtle">
            <button
              onClick={() => toggleExpand(i)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm hover:bg-surface-1 transition-colors"
            >
              <svg
                className={`w-3 h-3 text-[#555] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm text-[#aaa]">{tc.name}</span>
            </button>
            {isExpanded && (
              <div className="px-2.5 pb-2.5">
                <p className="text-[10px] font-mono text-[#666] uppercase mb-1">Input</p>
                <pre className="font-mono text-xs text-foreground-secondary bg-surface-1 border border-border-subtle p-2 overflow-x-auto">
                  {reconstructOperations(tc.operations, className)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TestResults({
  visibleResults,
  hiddenResults,
  testResultsPassed,
  totalPassed,
  totalCount,
  visibleTests,
  className,
  expanded,
  toggleExpand,
  executionTime,
}: {
  visibleResults: TestResult[];
  hiddenResults: TestResult[];
  testResultsPassed: boolean | null;
  totalPassed: number;
  totalCount: number;
  visibleTests: import('@/types').TestCase[];
  className: string;
  expanded: Set<number>;
  toggleExpand: (i: number) => void;
  executionTime: number | null;
}) {
  return (
    <div className="space-y-1.5">
      {/* Summary */}
      <div className={`text-xs font-mono px-2 py-1.5 mb-2 ${
        testResultsPassed === true ? 'text-success' :
        testResultsPassed === false ? 'text-danger' :
        'text-foreground-secondary'
      }`}>
        {totalPassed}/{totalCount} tests passed
        {visibleResults.length > 0 && hiddenResults.length > 0 && (
          <span className="ml-2 text-[#666]">
            ({visibleResults.filter(r => r.passed).length}/{visibleResults.length} visible, {hiddenResults.filter(r => r.passed).length}/{hiddenResults.length} hidden)
          </span>
        )}
      </div>
      {executionTime != null && (
        <div className="text-[10px] font-mono text-[#666] px-2 mb-1">
          Execution: {executionTime}ms
        </div>
      )}
      {hiddenResults.length > 0 ? (
        <div className="text-[10px] text-[#666] px-2 mb-1 font-mono">Submit results (all tests)</div>
      ) : (
        <div className="text-[10px] text-[#666] px-2 mb-1 font-mono">Run results (visible only)</div>
      )}

      {/* Visible results */}
      {visibleResults.map((result, i) => {
        const isExpanded = expanded.has(i) || !result.passed;
        const matchedTest = visibleTests.find((tc) => tc.name === result.name);
        return (
          <div key={i} className="border border-border-subtle">
            <button
              onClick={() => toggleExpand(i)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm hover:bg-surface-1 transition-colors"
            >
              <svg
                className={`w-3 h-3 text-[#555] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className={`text-sm font-medium ${result.passed ? 'text-success' : 'text-danger'}`}>
                {result.passed ? '\u2713' : '\u2717'}
              </span>
              <span className="text-sm text-foreground">{result.name}</span>
            </button>
            {isExpanded && (
              <div className="px-2.5 pb-2.5 space-y-2">
                {matchedTest && (
                  <div>
                    <p className="text-[10px] font-mono text-[#666] uppercase mb-1">Input</p>
                    <pre className="font-mono text-xs text-foreground-secondary bg-surface-1 border border-border-subtle p-2 overflow-x-auto">
                      {reconstructOperations(matchedTest.operations, className)}
                    </pre>
                  </div>
                )}
                <div className="text-xs font-mono space-y-0.5 text-[11px]">
                  {result.mismatchIndex != null && !result.passed ? (
                    <>
                      <div className="text-[#666] mb-0.5">
                        Failed at operation {result.mismatchIndex + 1}
                        {result.mismatchOperation && (
                          <span className="ml-1 text-[#555]">
                            ({(result.mismatchOperation[0] as string)})
                          </span>
                        )}
                      </div>
                      <div className="text-[#aaa]">
                        Expected: <span className="text-success">{formatValue(result.mismatchExpected)}</span>
                      </div>
                      <div className="text-[#aaa]">
                        Actual: <span className="text-danger">{formatValue(result.mismatchActual)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[#aaa]">
                        Expected: <span className="text-success">{result.expected}</span>
                      </div>
                      {(!result.passed || result.actual !== result.expected) && (
                        <div className="text-[#aaa]">
                          Actual: <span className="text-danger">{formatValue(result.actual)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {result.stdout && result.stdout.trim() && (
                  <div>
                    <p className="text-[10px] font-mono text-[#666] uppercase mb-1">Output</p>
                    <pre className="font-mono text-xs text-foreground/80 bg-surface-1 border border-border-subtle p-2 overflow-x-auto max-h-[20vh]">
                      {result.stdout}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Hidden results (only after submit) */}
      {hiddenResults.length > 0 && (
        <div className="border border-border mt-2 p-2.5">
          <div className="flex items-center gap-2 text-sm text-[#aaa]">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{hiddenResults.length} hidden test{hiddenResults.length !== 1 ? 's' : ''}</span>
            <span className="ml-auto text-xs">
              {hiddenResults.filter((r) => r.passed).length > 0 && (
                <span className="text-success mr-2">{hiddenResults.filter((r) => r.passed).length} passed</span>
              )}
              {hiddenResults.filter((r) => !r.passed).length > 0 && (
                <span className="text-danger">{hiddenResults.filter((r) => !r.passed).length} failed</span>
              )}
            </span>
          </div>
          {hiddenResults.filter((r) => !r.passed).map((result, i) => (
            <div key={i} className="mt-2 border-t border-border-subtle pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-danger">{'\u2717'}</span>
                <span className="text-sm text-[#aaa]">
                  {result.name} (hidden)
                  {result.mismatchIndex != null && (
                    <span className="ml-1 text-[#666]">
                      — failed at operation {result.mismatchIndex + 1}
                    </span>
                  )}
                </span>
              </div>
              {result.mismatchOperation && (
                <pre className="font-mono text-xs text-foreground-secondary bg-surface-1 border border-border-subtle p-2 ml-5 mt-1 overflow-x-auto">
                  {formatOperation(result.mismatchOperation, className)}
                </pre>
              )}
              {result.mismatchExpected != null && (
                <div className="text-xs font-mono ml-5 mt-1 space-y-0.5">
                  <div className="text-[#aaa]">
                    Expected: <span className="text-success">{formatValue(result.mismatchExpected)}</span>
                  </div>
                  {result.mismatchActual != null && (
                    <div className="text-[#aaa]">
                      Actual: <span className="text-danger">{formatValue(result.mismatchActual)}</span>
                    </div>
                  )}
                </div>
              )}
              {result.stdout && result.stdout.trim() && (
                <div className="ml-5 mt-1">
                  <p className="text-[10px] font-mono text-[#666] uppercase mb-1">Output</p>
                  <pre className="font-mono text-xs text-foreground/80 bg-surface-1 border border-border-subtle p-2 overflow-x-auto max-h-[20vh]">
                    {result.stdout}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
