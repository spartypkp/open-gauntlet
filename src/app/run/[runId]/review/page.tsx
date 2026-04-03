'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import type { Problem } from '@/types';

interface RunData {
  id: string;
  problemId: string;
  language: string;
  createdAt: number;
  startedAt: number | null;
  timeLimit: number;
  currentLevel: number;
  completedLevels: number[];
  levelTimes: Record<string, number>;
  status: string;
  submissions: SubmissionData[];
  score: ScoreData | null;
}

interface SubmissionData {
  id: string;
  level: number;
  timestamp: number;
  passed: boolean;
  results: {
    name: string;
    passed: boolean;
    hidden: boolean;
  }[];
}

interface ScoreData {
  levelsCompleted: number;
  totalLevels: number;
  totalTime: number;
  levelResults: {
    level: number;
    passed: boolean;
    submissions: number;
    timeSpent: number;
    visiblePassed: number;
    visibleTotal: number;
    hiddenPassed: number;
    hiddenTotal: number;
  }[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getScoreColor(levelsCompleted: number, totalLevels: number): string {
  const ratio = levelsCompleted / totalLevels;
  if (ratio === 1) return 'text-success';
  if (ratio >= 0.75) return 'text-cyan-400';
  if (ratio >= 0.5) return 'text-warning';
  return 'text-foreground';
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const [run, setRun] = useState<RunData | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const runRes = await fetch(`/api/runs/${runId}`);
      if (!runRes.ok) { setLoading(false); return; }
      const runData: RunData = await runRes.json();
      setRun(runData);

      const probRes = await fetch(`/api/problems/${runData.problemId}`);
      const probData: Problem = await probRes.json();
      setProblem(probData);
      setLoading(false);
    }
    load();
  }, [runId]);

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

  if (!run || !problem) {
    return (
      <div className="h-screen flex items-center justify-center text-[#aaa]">
        <span className="text-sm font-mono">Run not found.</span>
      </div>
    );
  }

  const score = run.score;
  const totalLevels = problem.levels.length;
  const levelsCompleted = run.completedLevels.length;
  const timeUsed = score?.totalTime ?? (run.startedAt
    ? Math.min(Math.round((Date.now() - run.startedAt) / 1000), run.timeLimit)
    : 0);
  const timePercent = Math.round((timeUsed / run.timeLimit) * 100);

  // Total test stats from score
  const totalVisiblePassed = score?.levelResults.reduce((s, l) => s + l.visiblePassed, 0) ?? 0;
  const totalVisibleTests = score?.levelResults.reduce((s, l) => s + l.visibleTotal, 0) ?? 0;
  const totalHiddenPassed = score?.levelResults.reduce((s, l) => s + l.hiddenPassed, 0) ?? 0;
  const totalHiddenTests = score?.levelResults.reduce((s, l) => s + l.hiddenTotal, 0) ?? 0;
  const totalSubmissions = score?.levelResults.reduce((s, l) => s + l.submissions, 0) ?? 0;

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Problem title */}
        <div className="text-xs font-mono text-[#aaa] mb-1">{problem.title}</div>

        {/* Score header */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-6xl font-bold tabular-nums ${getScoreColor(levelsCompleted, totalLevels)}`}>
              {levelsCompleted}/{totalLevels}
            </span>
            <span className="text-sm text-[#aaa] font-mono">levels completed</span>
          </div>

          {/* Summary stats row */}
          <div className="flex flex-wrap gap-6 text-sm font-mono">
            <div>
              <span className="text-[#aaa]">Time </span>
              <span className="text-[#ccc]">{formatTime(timeUsed)}</span>
              <span className="text-[#666]"> / {formatTime(run.timeLimit)}</span>
              <span className="text-[#aaa] ml-1">({timePercent}%)</span>
            </div>
            <div>
              <span className="text-[#aaa]">Tests </span>
              <span className="text-[#ccc]">{totalVisiblePassed + totalHiddenPassed}/{totalVisibleTests + totalHiddenTests}</span>
            </div>
            <div>
              <span className="text-[#aaa]">Submissions </span>
              <span className="text-[#ccc]">{totalSubmissions}</span>
            </div>
            <div>
              <span className={run.status === 'finished' ? 'text-success' : run.status === 'expired' ? 'text-warning' : 'text-[#aaa]'}>
                {run.status}
              </span>
            </div>
          </div>
        </div>

        {/* Level breakdown */}
        <h2 className="text-xs font-mono text-accent tracking-wide mb-4">LEVEL BREAKDOWN</h2>
        <div className="space-y-3 mb-10">
          {problem.levels.map((level) => {
            const levelScore = score?.levelResults.find(l => l.level === level.level);
            const completed = run.completedLevels.includes(level.level);
            const attempted = (levelScore?.submissions ?? 0) > 0;
            const timeAtCompletion = run.levelTimes[String(level.level)];

            return (
              <div
                key={level.level}
                className={`border p-4 ${
                  completed
                    ? 'border-success/20 bg-success/[0.03]'
                    : attempted
                    ? 'border-warning/20 bg-warning/[0.03]'
                    : 'border-border bg-surface-1/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#aaa]">L{level.level}</span>
                    <span className="text-sm font-medium text-foreground">{level.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {timeAtCompletion && (
                      <span className="text-xs font-mono text-[#aaa]">
                        {formatTime(timeAtCompletion)}
                      </span>
                    )}
                    {completed ? (
                      <span className="text-[10px] font-mono text-success bg-success/10 border border-success/20 px-1.5 py-0.5">
                        passed
                      </span>
                    ) : attempted ? (
                      <span className="text-[10px] font-mono text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5">
                        attempted
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#aaa] bg-surface-2 border border-border-subtle px-1.5 py-0.5">
                        not reached
                      </span>
                    )}
                  </div>
                </div>
                {levelScore && levelScore.submissions > 0 && (
                  <div className="flex gap-4 text-xs text-[#ccc] mt-2 font-mono">
                    <span>
                      {levelScore.submissions} submission{levelScore.submissions !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[#aaa]">
                      visible: {levelScore.visiblePassed}/{levelScore.visibleTotal}
                    </span>
                    <span className="text-[#aaa]">
                      hidden: {levelScore.hiddenPassed}/{levelScore.hiddenTotal}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/run/${run.id}`}
            className="px-4 py-2 bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            View Code
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-surface-2 border border-border text-foreground text-sm font-medium hover:bg-surface-3 transition-colors"
          >
            All Problems
          </Link>
        </div>
      </div>
    </div>
  );
}
