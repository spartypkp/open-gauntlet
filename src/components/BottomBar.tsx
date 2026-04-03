'use client';

interface BottomBarProps {
  currentLevel: number;
  totalLevels: number;
  canAdvance: boolean;
  locked: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onViewResults: () => void;
  onShowSolution?: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  reviewMode?: boolean;
}

export default function BottomBar({
  currentLevel,
  totalLevels,
  locked,
  isSubmitting,
  onSubmit,
  onViewResults,
  onShowSolution,
  saveStatus,
  reviewMode,
}: BottomBarProps) {
  if (reviewMode) {
    return (
      <div className="h-12 border-t border-border flex items-center px-5 shrink-0 bg-surface-0">
        <span className="text-xs text-[#aaa] font-mono">
          Level {currentLevel} of {totalLevels}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="bg-surface-2 border border-border text-foreground text-xs font-medium hover:bg-surface-3 transition-colors px-3.5 py-1.5"
          >
            All Problems
          </a>
          <button
            onClick={onViewResults}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors px-3.5 py-1.5"
          >
            View Stats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-12 border-t border-border flex items-center px-5 shrink-0 bg-surface-0">
      <span className="text-xs text-[#aaa] font-mono">
        Level {currentLevel} of {totalLevels}
      </span>
      {saveStatus === 'saving' && (
        <span className="text-[10px] text-warning font-mono ml-2">saving...</span>
      )}
      {saveStatus === 'saved' && (
        <span className="text-[10px] text-success/60 font-mono ml-2">saved</span>
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {!locked && onShowSolution && (
          <button
            onClick={onShowSolution}
            className="text-[#666] hover:text-warning transition-colors p-1.5 mr-1" title="View reference solution"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1zM10 18a3 3 0 01-2.83-2h5.66A3 3 0 0110 18zM13 14H7a1 1 0 010-2 5 5 0 01-1-9.9V2a1 1 0 112 0v.1A5 5 0 0114 12a1 1 0 010 2z" />
            </svg>
          </button>
        )}
        {locked && (
          <button
            onClick={onViewResults}
            className="bg-surface-2 border border-border text-foreground text-xs font-medium hover:bg-surface-3 transition-colors px-3.5 py-1.5"
          >
            View Results
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={locked || isSubmitting}
          className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-3 h-3 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
              Submitting
            </>
          ) : `SUBMIT L${currentLevel}`}
        </button>
      </div>
    </div>
  );
}
