'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ICFGuide from '@/components/ICFGuide';
import type { Problem } from '@/types';

interface ProblemStats {
  count: number;
  bestLevel: number;
  solved: boolean;
  lastAttempt: number;
}

interface RunHistoryItem {
  id: string;
  problemId: string;
  status: string;
  currentLevel: number;
  completedLevels: number[];
  createdAt: number;
  startedAt: number | null;
  timeLimit: number;
  elapsedAtPause: number | null;
  levelTimes: Record<number, number>;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

// Company associations based on verified ICF research
const COMPANY_ASSOCIATIONS: Record<string, { companies: string[]; confirmed: boolean }> = {
  'cloud-storage': { companies: ['Anthropic', 'Dropbox'], confirmed: true },
  'transaction-processor': { companies: ['Ramp', 'Coinbase'], confirmed: false },
};

// Practitioner-level descriptions: why this problem exists, what it tests
const PROBLEM_DESCRIPTIONS: Record<string, string> = {
  'cloud-storage': 'The single most common ICF problem domain. Anthropic and Dropbox both use variants. L3 hits you with per-user storage quotas that retroactively apply to everything you built. If your data model doesn\'t track ownership cleanly from L1, you\'re rewriting.',
  'transaction-processor': 'Ramp and Coinbase both run banking-flavored ICF problems. The trap is L3: scheduled payments that fire lazily on the next balance check. Candidates who model transactions as simple debits get stuck refactoring their entire history model.',
  'in-memory-database': 'Shows up at Anthropic. Classic key-value store that escalates into TTL expiration at L3, meaning every prior read/write operation needs timestamp awareness bolted in. The L4 backup/restore tests whether your architecture can snapshot and roll back cleanly.',
  'event-store': 'Event sourcing pattern. You build an append-only log, then derive state by replaying events. L3 forces you to handle event versioning and schema evolution. Tests whether you actually understand event-driven architecture or just know the buzzwords.',
  'job-queue': 'Priority queues with retry logic. L3 adds exponential backoff and dead letter queues, which means your simple dequeue logic needs to become state-aware. L4 visibility timeouts test distributed systems intuition.',
  'payroll-tracker': 'Interval-heavy problem. Track worker check-in/check-out times, compute hours, then L3 adds promotions with salary rate changes mid-period. The edge cases around overlapping intervals and retroactive rate changes are where candidates break.',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isThisYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    ...(isThisYear ? {} : { year: 'numeric' }),
  });
}

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, ProblemStats>>({});
  const [runs, setRuns] = useState<RunHistoryItem[]>([]);
  const [deletingRun, setDeletingRun] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/problems').then((r) => r.json()),
      fetch('/api/runs/stats').then((r) => r.json()),
      fetch('/api/runs').then((r) => r.json()),
    ])
      .then(([problems, statsData, runsData]: [Problem[], Record<string, ProblemStats>, RunHistoryItem[]]) => {
        setProblems(problems);
        setStats(statsData);
        setRuns(runsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(runId: string) {
    try {
      await fetch(`/api/runs/${runId}`, { method: 'DELETE' });
      setRuns(prev => prev.filter(r => r.id !== runId));
      // Refresh stats since they depend on runs
      const statsData = await fetch('/api/runs/stats').then(r => r.json());
      setStats(statsData);
    } catch {
      // silently fail
    } finally {
      setDeletingRun(null);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="relative max-w-6xl mx-auto px-6 py-14 sm:py-16">
          <div className="space-y-10">
            {/* Screenshot */}
            <div className="relative rounded-lg overflow-hidden border border-border bg-surface-1">
              <img
                src="/OpenGauntlet.png"
                alt="Open Gauntlet — timed coding assessment with level progression"
                className="w-full h-auto"
              />
            </div>

            {/* Copy */}
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-[1.15]">
                Practice the Gauntlet.
              </h1>
              <p className="text-[15px] text-[#b0b0b0] leading-relaxed mt-5">
                I spent months applying to companies like Anthropic, Ramp, Coinbase, and Perplexity.
                Almost every one used the same assessment format: one project, four escalating levels, 90
                minutes. You might know it as a CodeSignal ICF or a multi-level OA. You build something,
                then L3 forces you to refactor everything. There was almost no way to practice it
                realistically — so I built this.
              </p>
              <p className="text-[15px] text-[#999] leading-relaxed mt-3">
                The same pattern shows up on CodeSignal, CoderPad, in live interviews, and at onsite
                rounds. The mechanics vary — timers, automatic test gates, interviewer-paced — but the
                structure is the same.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Problem List */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
          <h2 className="text-xl font-semibold text-white mb-1">Practice Problems</h2>
          <p className="text-sm text-[#bbb] leading-relaxed mb-2">
            6 problems modeled on confirmed real assessments. Problems listed with a company name are based on
            candidate reports and public interview breakdowns — I went through several of these myself during
            my job search. The rest follow the same format and difficulty curve.
          </p>
          <p className="text-sm text-[#999] leading-relaxed mb-6">
            Each problem runs as a timed 90-minute session: four levels, test-gated progression. Write Python
            in the editor, run against visible tests, submit to check against hidden ones. Pass all tests and
            the next level unlocks. Your attempts save locally so you can review solutions and track improvement
            across sessions.
          </p>

          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-52 bg-surface-1 border border-border animate-pulse rounded-lg" />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-20 text-[#aaa]">
              <p className="font-mono text-sm">No problems found.</p>
              <p className="font-mono text-xs mt-2 text-[#888]">Check that problem files exist in problems/</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {problems.map((problem, i) => {
                const stat = stats[problem.id];
                const assoc = COMPANY_ASSOCIATIONS[problem.id];
                const problemRuns = runs.filter(r => r.problemId === problem.id && r.startedAt).slice(0, 5);
                const hasRuns = problemRuns.length > 0;
                return (
                  <div
                    key={problem.id}
                    className="animate-card-enter"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Link
                      href={`/run/new/${problem.id}`}
                      className={`group block relative bg-surface-1 border border-border hover:border-[#444] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] ${hasRuns ? 'rounded-t-lg border-b-0' : 'rounded-lg'}`}
                    >
                      <div className="px-6 py-5">
                        {/* Top row: title + companies + arrow */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <h2 className="text-lg font-semibold text-white group-hover:text-accent transition-colors">
                                {problem.title}
                              </h2>
                              {assoc && (
                                <span className="text-[10px] font-mono text-accent/80 bg-accent/[0.07] border border-accent/10 px-2 py-0.5 rounded-sm shrink-0">
                                  {assoc.confirmed ? '' : '~ '}
                                  {assoc.companies.join(' / ')}
                                </span>
                              )}
                            </div>
                            {(PROBLEM_DESCRIPTIONS[problem.id] || problem.description) && (
                              <p className="text-sm text-[#bbb] mt-1.5 leading-relaxed">
                                {PROBLEM_DESCRIPTIONS[problem.id] || problem.description}
                              </p>
                            )}
                          </div>
                          {/* Arrow */}
                          <div className="shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-md bg-surface-2 group-hover:bg-accent/10 transition-colors">
                            <svg className="w-4 h-4 text-[#888] group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* Levels */}
                        <div className="mt-4 grid grid-cols-4 gap-1.5">
                          {problem.levels.map((level, li) => {
                            const isPassBar = li === 2;
                            const isCompleted = stat && stat.bestLevel >= level.level;
                            return (
                              <div
                                key={level.level}
                                className={`relative px-3 py-2.5 rounded-md border transition-colors ${
                                  isCompleted
                                    ? 'bg-success/[0.06] border-success/20'
                                    : isPassBar
                                    ? 'bg-warning/[0.04] border-warning/15'
                                    : 'bg-surface-2/50 border-border-subtle'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-mono font-bold ${
                                    isCompleted
                                      ? 'text-success'
                                      : isPassBar
                                      ? 'text-warning'
                                      : 'text-[#888]'
                                  }`}>
                                    L{level.level}
                                  </span>
                                  {isPassBar && !isCompleted && (
                                    <span className="text-[8px] font-mono text-warning/70 uppercase tracking-wider">
                                      pass bar
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-xs font-medium leading-snug ${
                                  isCompleted
                                    ? 'text-[#ccc]'
                                    : isPassBar
                                    ? 'text-[#ccc]'
                                    : 'text-[#aaa]'
                                }`}>
                                  {level.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Stats row */}
                        {stat && stat.count > 0 && (
                          <div className="mt-3 flex items-center gap-4 pt-3 border-t border-border-subtle">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-[#888]">attempts</span>
                              <span className="text-xs font-mono text-[#bbb] font-medium">{stat.count}</span>
                            </div>
                            {stat.bestLevel > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-[#888]">best</span>
                                <span className={`text-xs font-mono font-medium ${
                                  stat.bestLevel >= 3 ? 'text-success' : 'text-[#bbb]'
                                }`}>
                                  L{stat.bestLevel}
                                </span>
                              </div>
                            )}
                            {stat.solved && (
                              <span className="text-[10px] font-mono text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-sm">
                                completed
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                    {hasRuns && (
                      <div className="bg-surface-1/50 border border-border rounded-b-lg px-6 py-3 space-y-1.5">
                        <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider mb-1">Recent Runs</div>
                        {problemRuns.map(run => {
                          const statusColors: Record<string, string> = {
                            active: 'text-accent', paused: 'text-warning', expired: 'text-danger', finished: 'text-success',
                          };
                          const statusLabels: Record<string, string> = {
                            active: 'in progress', paused: 'paused', expired: 'expired', finished: 'finished', setup: 'not started',
                          };
                          const isResumable = run.status === 'active' || run.status === 'paused';
                          const isConfirmingDelete = deletingRun === run.id;

                          // Calculate elapsed time
                          const totalLevelTime = Object.values(run.levelTimes || {}).reduce((a: number, b: number) => a + b, 0);
                          const elapsed = run.elapsedAtPause || totalLevelTime || (
                            run.startedAt ? Math.floor((Date.now() - run.startedAt) / 1000) : 0
                          );
                          const levelsCompleted = run.completedLevels?.length || 0;

                          return (
                            <div key={run.id} className="flex items-center gap-3 text-xs font-mono py-1.5 px-2 -mx-2 rounded group">
                              <a
                                href={`/run/${run.id}`}
                                className="flex items-center gap-3 flex-1 min-w-0 hover:bg-surface-2/50 rounded px-1 -mx-1 py-0.5 transition-colors"
                              >
                                {/* Status */}
                                <span className={`shrink-0 w-[72px] ${statusColors[run.status] || 'text-[#888]'}`}>
                                  {statusLabels[run.status] || run.status}
                                </span>
                                {/* Level reached */}
                                <span className="text-[#aaa] shrink-0">
                                  {levelsCompleted > 0
                                    ? <span>L{levelsCompleted}<span className="text-[#555]">/4</span></span>
                                    : <span className="text-[#555]">L0/4</span>
                                  }
                                </span>
                                {/* Time used */}
                                {elapsed > 0 && (
                                  <span className="text-[#666] shrink-0">{formatDuration(elapsed)}</span>
                                )}
                                {/* Date */}
                                <span className="text-[#555] shrink-0">{formatDate(run.createdAt)}</span>
                                {/* Action */}
                                <span className="ml-auto text-[10px] text-accent/70 shrink-0">
                                  {isResumable ? 'Continue →' : 'Review code →'}
                                </span>
                              </a>
                              {/* Delete */}
                              {isConfirmingDelete ? (
                                <span className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={(e) => { e.preventDefault(); handleDelete(run.id); }}
                                    className="text-[10px] text-danger hover:text-red-400 transition-colors"
                                  >
                                    confirm
                                  </button>
                                  <button
                                    onClick={(e) => { e.preventDefault(); setDeletingRun(null); }}
                                    className="text-[10px] text-[#666] hover:text-[#aaa] transition-colors"
                                  >
                                    cancel
                                  </button>
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => { e.preventDefault(); setDeletingRun(run.id); }}
                                  className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-danger transition-all shrink-0"
                                  title="Delete run"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ICF Guide */}
      <ICFGuide />

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-[#888] font-mono">
          <span>open-gauntlet</span>
          <a
            href="https://github.com/spartypkp/open-gauntlet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#bbb] transition-colors"
          >
            github.com/spartypkp/open-gauntlet
          </a>
        </div>
      </footer>
    </main>
  );
}
