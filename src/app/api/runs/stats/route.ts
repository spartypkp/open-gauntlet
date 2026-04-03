import { NextResponse } from 'next/server';
import { listRuns } from '@/lib/runs';

export interface ProblemStats {
  count: number;
  bestLevel: number;
  solved: boolean;
  lastAttempt: number; // timestamp
}

// GET /api/runs/stats — Attempt stats grouped by problemId
export async function GET() {
  try {
    const runs = await listRuns();
    const stats: Record<string, ProblemStats> = {};

    for (const run of runs) {
      // Only count runs that were actually started
      if (!run.startedAt) continue;

      const existing = stats[run.problemId];
      const levelsCompleted = run.completedLevels.length;
      const totalLevels = 4; // all problems have 4 levels
      const solved = levelsCompleted === totalLevels;

      if (!existing) {
        stats[run.problemId] = {
          count: 1,
          bestLevel: levelsCompleted,
          solved,
          lastAttempt: run.createdAt,
        };
      } else {
        existing.count++;
        if (levelsCompleted > existing.bestLevel) existing.bestLevel = levelsCompleted;
        if (solved) existing.solved = true;
        if (run.createdAt > existing.lastAttempt) existing.lastAttempt = run.createdAt;
      }
    }

    return NextResponse.json(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to compute stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
