'use client';

import { useEffect, useState, useRef, useCallback, use } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useSession } from '@/hooks/useSession';
import type { Problem } from '@/types';
import Timer from '@/components/Timer';
import Editor from '@/components/Editor';
import IconSidebar from '@/components/IconSidebar';
import DescriptionPanel from '@/components/DescriptionPanel';
import TestPanel from '@/components/TestPanel';
import BottomBar from '@/components/BottomBar';
import DevPanel from '@/components/DevPanel';
import SolutionModal from '@/components/SolutionModal';
import StatsModal from '@/components/StatsModal';

interface RunMeta {
  id: string;
  problemId: string;
  language: string;
  startedAt: number | null;
  timeLimit: number;
  status: string;
  currentLevel: number;
  completedLevels: number[];
  levelTimes: Record<number, number>;
  savedCode: string | null;
  elapsedAtPause: number | null;
  score: { levelsCompleted: number; totalLevels: number; totalTime: number; levelResults: { level: number; passed: boolean; submissions: number; timeSpent: number; visiblePassed: number; visibleTotal: number; hiddenPassed: number; hiddenTotal: number; }[]; } | null;
}

export default function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const { state, dispatch, runCode, submitLevel } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [loadingSolution, setLoadingSolution] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [runData, setRunData] = useState<RunMeta | null>(null);

  useEffect(() => {
    setDevMode(new URLSearchParams(window.location.search).has('dev'));
  }, []);

  // Load run metadata and problem, then initialize session
  useEffect(() => {
    async function init() {
      try {
        const runRes = await fetch(`/api/runs/${runId}`);
        if (!runRes.ok) {
          setError(runRes.status === 404 ? 'Run not found' : 'Failed to load run');
          setLoading(false);
          return;
        }
        const run: RunMeta & { savedCode?: string | null } = await runRes.json();
        setRunData(run);

        const problemRes = await fetch(`/api/problems/${run.problemId}`);
        if (!problemRes.ok) {
          setError('Problem not found');
          setLoading(false);
          return;
        }
        const problem: Problem = await problemRes.json();

        if (run.status === 'finished' || run.status === 'expired') {
          // Review mode: read-only with current code
          dispatch({
            type: 'HYDRATE',
            problem,
            runId: run.id,
            session: {
              id: run.id,
              problemId: run.problemId,
              language: run.language,
              startedAt: run.startedAt || Date.now(),
              timeLimit: run.timeLimit,
              currentLevel: (run.currentLevel || 1) as 1 | 2 | 3 | 4,
              completedLevels: run.completedLevels || [],
              levelTimes: run.levelTimes || {},
              code: run.savedCode || '',
              submissions: [],
            },
          });
          dispatch({ type: 'ENTER_REVIEW' });
          setShowStats(true);
        } else if (run.startedAt && run.status === 'active') {
          dispatch({
            type: 'HYDRATE',
            problem,
            runId: run.id,
            session: {
              id: run.id,
              problemId: run.problemId,
              language: run.language,
              startedAt: run.startedAt,
              timeLimit: run.timeLimit,
              currentLevel: (run.currentLevel || 1) as 1 | 2 | 3 | 4,
              completedLevels: run.completedLevels || [],
              levelTimes: run.levelTimes || {},
              code: run.savedCode || problem.starterCode[run.language] || '',
              submissions: [],
            },
          });
        } else if (run.status === 'paused' && run.startedAt && run.elapsedAtPause != null) {
          const adjustedStartedAt = Date.now() - (run.elapsedAtPause * 1000);
          dispatch({
            type: 'HYDRATE',
            problem,
            runId: run.id,
            session: {
              id: run.id,
              problemId: run.problemId,
              language: run.language,
              startedAt: adjustedStartedAt,
              timeLimit: run.timeLimit,
              currentLevel: (run.currentLevel || 1) as 1 | 2 | 3 | 4,
              completedLevels: run.completedLevels || [],
              levelTimes: run.levelTimes || {},
              code: run.savedCode || problem.starterCode[run.language] || '',
              submissions: [],
            },
          });
          dispatch({ type: 'PAUSE' });
        } else {
          dispatch({ type: 'INIT', problem, language: run.language, runId: run.id });
          dispatch({ type: 'START' });

          fetch(`/api/runs/${runId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active', startedAt: Date.now() }),
          });
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setLoading(false);
      }
    }
    init();
  }, [runId, dispatch]);

  // When session ends, update server, show overlay, then enter review + stats modal
  useEffect(() => {
    if (!state.expired && !state.finished) return;
    if (!state.session || !state.runId || !state.problem) return;
    if (state.reviewMode) return;

    const status = state.finished ? 'finished' : 'expired';
    fetch(`/api/runs/${state.runId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        completedLevels: state.session.completedLevels,
        currentLevel: state.session.currentLevel,
        levelTimes: state.session.levelTimes,
      }),
    });

    const timer = setTimeout(async () => {
      dispatch({ type: 'ENTER_REVIEW' });
      // Fetch fresh run data with computed score for the stats modal
      const res = await fetch(`/api/runs/${state.runId}`);
      if (res.ok) {
        const freshRun = await res.json();
        setRunData(freshRun);
      }
      setShowStats(true);
    }, state.finished ? 2000 : 3000);
    return () => clearTimeout(timer);
  }, [state.expired, state.finished, state.session, state.runId, state.problem, state.reviewMode, dispatch]);

  // Sync level changes to server
  const prevLevelRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!state.session || !state.runId) return;
    if (prevLevelRef.current === undefined) {
      prevLevelRef.current = state.session.currentLevel;
      return;
    }
    if (state.session.currentLevel === prevLevelRef.current) return;
    prevLevelRef.current = state.session.currentLevel;

    fetch(`/api/runs/${state.runId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentLevel: state.session.currentLevel,
        completedLevels: state.session.completedLevels,
        levelTimes: state.session.levelTimes,
      }),
    });
  }, [state.session?.currentLevel, state.session?.completedLevels, state.session?.levelTimes, state.runId, state.session]);

  // Ctrl+Enter to run code
  const runCodeRef = useRef(runCode);
  runCodeRef.current = runCode;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCodeRef.current();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-clear level completion banner after 3s
  useEffect(() => {
    if (!state.levelJustCompleted) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_LEVEL_COMPLETE' }), 3000);
    return () => clearTimeout(timer);
  }, [state.levelJustCompleted, dispatch]);

  const handlePause = useCallback(async () => {
    if (!state.session || !state.runId || state.paused || state.expired || state.finished) return;
    const elapsed = Math.floor((Date.now() - state.session.startedAt) / 1000);
    dispatch({ type: 'PAUSE' });
    await fetch(`/api/runs/${state.runId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused', elapsedAtPause: elapsed }),
    });
  }, [state.session, state.runId, state.paused, state.expired, state.finished, dispatch]);

  const handleResume = useCallback(async () => {
    if (!state.session || !state.runId || !state.paused) return;
    const res = await fetch(`/api/runs/${state.runId}`);
    const run = await res.json();
    if (run.elapsedAtPause == null) return;
    const adjustedStartedAt = Date.now() - (run.elapsedAtPause * 1000);
    dispatch({ type: 'RESUME' });
    dispatch({
      type: 'HYDRATE',
      problem: state.problem!,
      runId: state.runId,
      session: { ...state.session, startedAt: adjustedStartedAt },
    });
    await fetch(`/api/runs/${state.runId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active', startedAt: adjustedStartedAt, elapsedAtPause: null }),
    });
  }, [state.session, state.runId, state.paused, state.problem, dispatch]);

  const loadSolution = useCallback(async () => {
    if (!state.problem || !state.session) return;
    setLoadingSolution(true);
    setShowSolutionModal(false);
    try {
      const res = await fetch(`/api/problems/${state.problem.id}/solution?level=${state.session.currentLevel}`);
      if (!res.ok) return;
      const data = await res.json();
      dispatch({ type: 'UPDATE_CODE', code: data.code });
    } finally {
      setLoadingSolution(false);
    }
  }, [state.problem, state.session, dispatch]);

  const { problem, session, leftTab, canAdvance, runOutput, testResults, testResultsPassed, isRunning, isSubmitting, expired, paused, finished, settings, saveStatus, lastExecutionTime, reviewMode } = state;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[#aaa]">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !problem || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-[#aaa] gap-4">
        <span className="text-sm font-mono">{error || 'Session not found'}</span>
        <a href="/" className="text-xs text-accent hover:underline">Back to problems</a>
      </div>
    );
  }

  const locked = expired || finished || paused || reviewMode;

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center px-5 gap-2.5 shrink-0 bg-surface-0">
        <a href="/" className="text-sm font-bold text-foreground font-mono tracking-tight hover:opacity-80 transition-opacity">
          open-gauntlet
        </a>
        <div className="w-px h-4 bg-border" />
        <span className="text-foreground-secondary text-sm truncate font-medium">
          {problem.title} - Level {session.currentLevel} of {problem.levels.length}
        </span>
        <div className="flex-1" />
        {reviewMode ? (
          <span className="text-xs font-mono text-foreground-secondary">review</span>
        ) : (
          <>
            <Timer
              startedAt={session.startedAt}
              timeLimit={session.timeLimit}
              onExpire={() => dispatch({ type: 'TIMER_EXPIRE' })}
              expired={expired}
              paused={paused}
            />
            {!expired && !finished && !paused && state.started && (
              <button onClick={handlePause} className="text-foreground-secondary hover:text-foreground transition-colors p-1 ml-2" title="Pause timer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </>
        )}
      </header>

      {/* Level completion banner */}
      {state.levelJustCompleted && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-success/10 border border-success/30 text-success px-6 py-2 text-sm font-medium animate-slide-down">
          Level {state.levelJustCompleted} passed!
        </div>
      )}

      {/* Time's up overlay */}
      {expired && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in">
          <div className="text-center animate-slide-up">
            <div className="text-4xl font-bold text-danger mb-2">Time&apos;s Up</div>
            <div className="text-foreground-secondary text-sm">Entering review mode...</div>
          </div>
        </div>
      )}

      {/* All levels complete overlay */}
      {finished && !expired && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in">
          <div className="text-center animate-slide-up">
            <div className="text-4xl font-bold text-success mb-2">Complete!</div>
            <div className="text-foreground-secondary text-sm">All levels passed</div>
          </div>
        </div>
      )}

      {/* Paused overlay */}
      {paused && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in">
          <div className="text-center animate-slide-up">
            <div className="text-3xl font-bold text-warning mb-4">Paused</div>
            <button onClick={handleResume} className="bg-accent hover:bg-accent/80 text-white font-semibold px-8 py-3 text-sm transition-colors">
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <Group orientation="horizontal" className="flex-1">
        {/* LEFT: Icon sidebar + Description panel */}
        <Panel defaultSize={35} minSize={20}>
          <div className="h-full flex">
            <IconSidebar
              activeTab={leftTab}
              onTabChange={(tab) => dispatch({ type: 'SET_LEFT_TAB', tab })}
            />
            <DescriptionPanel
              activeTab={leftTab}
              problem={problem}
              currentLevel={session.currentLevel}
              completedLevels={session.completedLevels}
              settings={settings}
              onUpdateSettings={(s) => dispatch({ type: 'UPDATE_SETTINGS', settings: s })}
              disabled={locked}
              reviewMode={reviewMode}
            />
          </div>
        </Panel>

        <Separator className="w-[2px] bg-border hover:bg-accent/40 transition-colors cursor-col-resize" />

        {/* RIGHT: Editor (top) + Test panel (bottom) */}
        <Panel defaultSize={65} minSize={40}>
          <Group orientation="vertical" className="h-full">
            {/* Editor with file tab */}
            <Panel defaultSize={60} minSize={25}>
              <div className="h-full flex flex-col bg-surface-1">
                <div className="h-8 border-b border-border flex items-center px-3 shrink-0 bg-surface-0">
                  <span className="text-xs font-mono text-foreground-secondary">
                    solution.{session.language === 'python' ? 'py' : session.language === 'javascript' ? 'js' : session.language}
                  </span>
                </div>
                <div className="flex-1">
                  <Editor
                    code={session.code}
                    language={session.language}
                    readOnly={locked}
                    settings={settings}
                    onChange={(code) => dispatch({ type: 'UPDATE_CODE', code })}
                  />
                </div>
              </div>
            </Panel>

            <Separator className="h-[2px] bg-border hover:bg-accent/40 transition-colors cursor-row-resize" />

            {/* Test panel */}
            <Panel defaultSize={40} minSize={15}>
              <TestPanel
                problem={problem}
                currentLevel={session.currentLevel}
                testResults={testResults}
                testResultsPassed={testResultsPassed}
                runOutput={runOutput}
                onRun={runCode}
                isRunning={isRunning}
                locked={locked}
                executionTime={lastExecutionTime}
                runId={state.runId}
                code={session.code}
              />
            </Panel>
          </Group>
        </Panel>
      </Group>

      {/* Bottom bar */}
      <BottomBar
        currentLevel={session.currentLevel}
        totalLevels={problem.levels.length}
        canAdvance={canAdvance}
        locked={locked}
        isSubmitting={isSubmitting}
        onSubmit={submitLevel}
        onNext={() => dispatch({ type: 'NEXT_LEVEL' })}
        onViewResults={() => setShowStats(true)}
        onShowSolution={() => setShowSolutionModal(true)}
        saveStatus={saveStatus}
        reviewMode={reviewMode}
      />

      {devMode && (
        <DevPanel
          problem={problem}
          currentLevel={session.currentLevel}
          dispatch={dispatch}
        />
      )}

      {showSolutionModal && session && (
        <SolutionModal level={session.currentLevel} onConfirm={loadSolution} onCancel={() => setShowSolutionModal(false)} />
      )}

      {/* Stats modal */}
      {showStats && runData && problem && (
        <StatsModal
          run={runData}
          problem={problem}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}
