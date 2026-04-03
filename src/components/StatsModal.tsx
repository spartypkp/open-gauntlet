'use client';

import type { Problem } from '@/types';

interface RunData {
  id: string;
  problemId: string;
  status: string;
  timeLimit: number;
  startedAt: number | null;
  completedLevels: number[];
  levelTimes: Record<string, number>;
  score: ScoreData | null;
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

interface StatsModalProps {
  run: RunData;
  problem: Problem;
  onClose: () => void;
}

export default function StatsModal({ run, problem, onClose }: StatsModalProps) {
  const score = run.score;
  const totalLevels = problem.levels.length;
  const levelsCompleted = run.completedLevels.length;
  const timeUsed = score?.totalTime ?? (run.startedAt
    ? Math.min(Math.round((Date.now() - run.startedAt) / 1000), run.timeLimit)
    : 0);
  const timePercent = Math.round((timeUsed / run.timeLimit) * 100);

  const totalVisiblePassed = score?.levelResults.reduce((s, l) => s + l.visiblePassed, 0) ?? 0;
  const totalVisibleTests = score?.levelResults.reduce((s, l) => s + l.visibleTotal, 0) ?? 0;
  const totalHiddenPassed = score?.levelResults.reduce((s, l) => s + l.hiddenPassed, 0) ?? 0;
  const totalHiddenTests = score?.levelResults.reduce((s, l) => s + l.hiddenTotal, 0) ?? 0;
  const totalSubmissions = score?.levelResults.reduce((s, l) => s + l.submissions, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div
        className="bg-surface-0 border border-border w-full max-w-2xl max-h-[80vh] overflow-auto mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs font-mono text-[#aaa] mb-1">{problem.title}</div>
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-bold tabular-nums ${getScoreColor(levelsCompleted, totalLevels)}`}>
                  {levelsCompleted}/{totalLevels}
                </span>
                <span className="text-sm text-[#aaa] font-mono">levels completed</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-foreground transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary stats */}
          <div className="flex flex-wrap gap-6 text-sm font-mono mb-6">
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

          {/* Level breakdown */}
          <h2 className="text-xs font-mono text-accent tracking-wide mb-3">LEVEL BREAKDOWN</h2>
          <div className="space-y-2">
            {problem.levels.map((level) => {
              const levelScore = score?.levelResults.find(l => l.level === level.level);
              const completed = run.completedLevels.includes(level.level);
              const attempted = (levelScore?.submissions ?? 0) > 0;
              const timeAtCompletion = run.levelTimes[String(level.level)];

              return (
                <div
                  key={level.level}
                  className={`border p-3 ${
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
                    <div className="flex gap-4 text-xs text-[#ccc] mt-1 font-mono">
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
        </div>
      </div>
    </div>
  );
}
