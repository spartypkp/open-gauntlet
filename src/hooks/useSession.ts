'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { Problem, Session, Submission } from '@/types';
import type { RunResponse, ValidateResponse } from '@/types';

export interface SessionState {
  problem: Problem | null;
  session: Session | null;
  runId: string | null;
  started: boolean; // false = pre-session setup, true = timer running
  leftTab: 'description' | 'rules' | 'settings';
  canAdvance: boolean;
  runOutput: { stdout: string; stderr: string } | null;
  testResults: import('@/types').TestResult[] | null; // Latest test results (from Run or Submit)
  testResultsPassed: boolean | null; // null = Run (no verdict), true/false = Submit verdict
  isRunning: boolean;
  isSubmitting: boolean;
  expired: boolean;
  paused: boolean;
  finished: boolean;
  levelJustCompleted: number | null; // for success animation
  saveStatus: 'idle' | 'saving' | 'saved';
  lastExecutionTime: number | null;
  settings: SessionSettings;
  reviewMode: boolean;
}

export interface SessionSettings {
  keybindings: 'default' | 'vim' | 'emacs';
  fontSize: number;
  autocomplete: boolean;
  timerMinutes: number;
}

const defaultSettings: SessionSettings = {
  keybindings: 'default',
  fontSize: 14,
  autocomplete: false,
  timerMinutes: 90,
};

function loadSettings(): SessionSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const saved = localStorage.getItem('interviewpad-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const { theme: _theme, ...rest } = parsed;
      return { ...defaultSettings, ...rest };
    }
  } catch { /* ignore */ }
  return defaultSettings;
}

type Action =
  | { type: 'INIT'; problem: Problem; language: string; runId: string }
  | { type: 'START' }
  | { type: 'UPDATE_CODE'; code: string }
  | { type: 'SET_LANGUAGE'; language: string }
  | { type: 'SET_LEFT_TAB'; tab: SessionState['leftTab'] }
  | { type: 'RUN_START' }
  | { type: 'RUN_RESULT'; result: RunResponse }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_RESULT'; result: ValidateResponse; level: number }
  | { type: 'TIMER_EXPIRE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<SessionSettings> }
  | { type: 'VIEW_LEVEL'; level: number }
  | { type: 'CLEAR_LEVEL_COMPLETE' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'DEV_SET_LEVEL'; level: 1 | 2 | 3 | 4 }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_DONE' }
  | { type: 'HYDRATE'; session: Session; problem: Problem; runId: string }
  | { type: 'ENTER_REVIEW' };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'INIT': {
      const settings = state.settings;
      const session: Session = {
        id: action.runId,
        problemId: action.problem.id,
        language: action.language,
        startedAt: 0,
        timeLimit: settings.timerMinutes * 60,
        currentLevel: 1,
        completedLevels: [],
        levelTimes: {},
        code: action.problem.starterCode[action.language] || '',
        submissions: [],
      };
      return {
        ...state,
        problem: action.problem,
        session,
        runId: action.runId,
        started: false,
        leftTab: 'description',
        canAdvance: false,
        runOutput: null,
        testResults: null,
        testResultsPassed: null,
        expired: false,
        finished: false,
        levelJustCompleted: null,
      };
    }

    case 'START': {
      if (!state.session) return state;
      return {
        ...state,
        started: true,
        session: {
          ...state.session,
          startedAt: Date.now(),
          timeLimit: state.settings.timerMinutes * 60,
        },
      };
    }

    case 'SET_LANGUAGE': {
      if (!state.session || !state.problem || state.started) return state;
      return {
        ...state,
        session: {
          ...state.session,
          language: action.language,
          code: state.problem.starterCode[action.language] || '',
        },
      };
    }

    case 'UPDATE_CODE':
      if (!state.session) return state;
      return { ...state, session: { ...state.session, code: action.code } };

    case 'SET_LEFT_TAB':
      return { ...state, leftTab: action.tab };

    case 'RUN_START':
      return { ...state, isRunning: true };

    case 'RUN_RESULT':
      return {
        ...state,
        isRunning: false,
        runOutput: { stdout: action.result.stdout, stderr: action.result.stderr },
        lastExecutionTime: action.result.executionTime || null,
        testResults: action.result.results ?? state.testResults,
        testResultsPassed: action.result.results ? null : state.testResultsPassed,
      };

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };

    case 'SUBMIT_RESULT': {
      if (!state.session) return state;
      const submission: Submission = {
        level: action.level,
        timestamp: Date.now(),
        code: state.session.code,
        results: action.result.results,
        passed: action.result.passed,
      };
      const submissions = [...state.session.submissions, submission];
      const completedLevels = action.result.passed
        ? [...new Set([...state.session.completedLevels, action.level])]
        : state.session.completedLevels;
      const maxLevel = state.problem?.levels.length ?? 4;
      const now = Date.now();
      const levelTimes = { ...state.session.levelTimes };
      if (action.result.passed && !levelTimes[action.level]) {
        levelTimes[action.level] = Math.round((now - state.session.startedAt) / 1000);
      }
      const finished = action.result.passed && action.level === maxLevel;
      // Auto-advance to next level on pass
      const autoAdvancing = action.result.passed && !finished;
      const nextLevel = autoAdvancing
        ? Math.min(state.session.currentLevel + 1, maxLevel) as 1 | 2 | 3 | 4
        : state.session.currentLevel;
      return {
        ...state,
        isSubmitting: false,
        // Clear test UI when advancing so it shows the new level's tests
        runOutput: autoAdvancing ? null : { stdout: action.result.stdout, stderr: action.result.stderr },
        testResults: autoAdvancing ? null : action.result.results,
        testResultsPassed: autoAdvancing ? null : action.result.passed,
        canAdvance: false,
        finished,
        levelJustCompleted: action.result.passed ? action.level : null,
        session: {
          ...state.session,
          submissions,
          completedLevels,
          currentLevel: nextLevel,
          levelTimes,
        },
      };
    }

    case 'TIMER_EXPIRE':
      return { ...state, expired: true };

    case 'PAUSE':
      return { ...state, paused: true };

    case 'RESUME': {
      if (!state.session) return state;
      return { ...state, paused: false };
    }

    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.settings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('interviewpad-settings', JSON.stringify(settings));
      }
      if (!state.started && state.session && action.settings.timerMinutes) {
        return {
          ...state,
          settings,
          session: {
            ...state.session,
            timeLimit: settings.timerMinutes * 60,
          },
        };
      }
      return { ...state, settings };
    }

    case 'VIEW_LEVEL':
      return { ...state, leftTab: 'description' };

    case 'CLEAR_LEVEL_COMPLETE':
      return { ...state, levelJustCompleted: null };

    case 'NEXT_LEVEL': {
      if (!state.session || !state.problem || !state.canAdvance) return state;
      const maxLevel = state.problem.levels.length;
      const nextLevel = Math.min(state.session.currentLevel + 1, maxLevel) as 1 | 2 | 3 | 4;
      return {
        ...state,
        testResults: null,
        testResultsPassed: null,
        runOutput: null,
        canAdvance: false,
        levelJustCompleted: null,
        session: {
          ...state.session,
          currentLevel: nextLevel,
        },
      };
    }

    case 'DEV_SET_LEVEL': {
      if (!state.session || !state.problem) return state;
      const completedLevels = Array.from({ length: action.level - 1 }, (_, i) => i + 1);
      return {
        ...state,
        testResults: null,
        testResultsPassed: null,
        runOutput: null,
        canAdvance: false,
        levelJustCompleted: null,
        session: {
          ...state.session,
          currentLevel: action.level,
          completedLevels,
        },
      };
    }

    case 'SAVE_START':
      return { ...state, saveStatus: 'saving' as const };

    case 'SAVE_DONE':
      return { ...state, saveStatus: 'saved' as const };

    case 'HYDRATE':
      return {
        ...state,
        problem: action.problem,
        session: action.session,
        runId: action.runId,
        started: true,
        leftTab: 'description',
        canAdvance: false,
        runOutput: null,
        testResults: null,
        testResultsPassed: null,
        expired: false,
        finished: false,
        levelJustCompleted: null,
      };

    case 'ENTER_REVIEW': {
      if (!state.session) return state;
      return {
        ...state,
        reviewMode: true,
        expired: false,
        finished: false,
        levelJustCompleted: null,
      };
    }

    default:
      return state;
  }
}

export function useSession() {
  const [state, dispatch] = useReducer(reducer, {
    problem: null,
    session: null,
    runId: null,
    started: false,
    leftTab: 'description' as const,
    canAdvance: false,
    runOutput: null,
    testResults: null,
    testResultsPassed: null,
    isRunning: false,
    isSubmitting: false,
    expired: false,
    paused: false,
    finished: false,
    levelJustCompleted: null,
    saveStatus: 'idle' as const,
    lastExecutionTime: null,
    settings: loadSettings(),
    reviewMode: false,
  });

  // Debounced save to disk
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedCodeRef = useRef<string>('');

  useEffect(() => {
    if (!state.runId || !state.session || !state.started) return;
    if (state.session.code === lastSavedCodeRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      dispatch({ type: 'SAVE_START' });
      lastSavedCodeRef.current = state.session!.code;
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: state.runId, code: state.session!.code }),
      })
        .then(() => dispatch({ type: 'SAVE_DONE' }))
        .catch(() => dispatch({ type: 'SAVE_DONE' }));
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.session?.code, state.runId, state.started, state.session]);

  const runCode = useCallback(async () => {
    if (!state.session || !state.runId || state.expired || state.finished) return;
    dispatch({ type: 'RUN_START' });
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: state.runId, code: state.session.code, level: state.session.currentLevel }),
      });
      const result: RunResponse = await res.json();
      dispatch({ type: 'RUN_RESULT', result });
    } catch (err) {
      dispatch({ type: 'RUN_RESULT', result: { stdout: '', stderr: String(err), exitCode: 1, executionTime: 0 } });
    }
  }, [state.session, state.runId, state.expired, state.finished]);

  const submitLevel = useCallback(async () => {
    if (!state.session || !state.runId || !state.problem || state.expired || state.finished) return;
    dispatch({ type: 'SUBMIT_START' });
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: state.runId,
          code: state.session.code,
          level: state.session.currentLevel,
        }),
      });
      const result: ValidateResponse = await res.json();
      dispatch({ type: 'SUBMIT_RESULT', result, level: state.session.currentLevel });
    } catch (err) {
      dispatch({
        type: 'SUBMIT_RESULT',
        result: { passed: false, results: [], stdout: '', stderr: String(err) },
        level: state.session.currentLevel,
      });
    }
  }, [state.session, state.runId, state.problem, state.expired, state.finished]);

  return { state, dispatch, runCode, submitLevel };
}
