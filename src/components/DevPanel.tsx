'use client';

import { useState } from 'react';
import type { Problem } from '@/types';

type DevAction =
  | { type: 'DEV_SET_LEVEL'; level: 1 | 2 | 3 | 4 }
  | { type: 'UPDATE_CODE'; code: string }
  | { type: 'TIMER_EXPIRE' };

interface DevPanelProps {
  problem: Problem;
  currentLevel: number;
  dispatch: (action: DevAction) => void;
}

export default function DevPanel({ problem, currentLevel, dispatch }: DevPanelProps) {
  const [loading, setLoading] = useState(false);
  const maxLevel = problem.levels.length;

  async function loadSolution() {
    setLoading(true);
    try {
      const res = await fetch(`/api/problems/${problem.id}/solution?level=${currentLevel}`);
      if (!res.ok) return;
      const data = await res.json();
      dispatch({ type: 'UPDATE_CODE', code: data.code });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-16 right-4 z-50 bg-surface-2 border border-border p-3 space-y-2 shadow-lg w-48 text-xs font-mono">
      <div className="text-accent font-semibold text-[10px] uppercase tracking-wider mb-1">Dev Tools</div>

      {/* Level buttons */}
      <div className="flex gap-1">
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
          <button
            key={level}
            onClick={() => dispatch({ type: 'DEV_SET_LEVEL', level: level as 1 | 2 | 3 | 4 })}
            className={`flex-1 py-1 border transition-colors ${
              level === currentLevel
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-[#aaa] hover:bg-surface-3'
            }`}
          >
            L{level}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <button
        onClick={loadSolution}
        disabled={loading}
        className="w-full py-1.5 bg-success/20 text-success border border-success/30 hover:bg-success/30 transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : `Load Solution L${currentLevel}`}
      </button>

      <button
        onClick={() => dispatch({ type: 'TIMER_EXPIRE' })}
        className="w-full py-1.5 bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors"
      >
        Expire Timer
      </button>

      <button
        onClick={() => dispatch({ type: 'DEV_SET_LEVEL', level: currentLevel as 1 | 2 | 3 | 4 })}
        className="w-full py-1.5 bg-surface-3 text-[#aaa] border border-border hover:bg-surface-2 transition-colors"
      >
        Reset Tests
      </button>
    </div>
  );
}
