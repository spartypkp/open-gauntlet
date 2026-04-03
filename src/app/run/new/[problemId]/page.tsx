'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import type { Problem } from '@/types';
import type { SessionSettings } from '@/hooks/useSession';
import Description from '@/components/Description';

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

export default function SetupPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = use(params);
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState('python');
  const [settings, setSettings] = useState<SessionSettings>(loadSettings);
  const [starting, setStarting] = useState(false);
  const [activeLevel, setActiveLevel] = useState(0); // index into problem.levels

  useEffect(() => {
    fetch(`/api/problems/${problemId}`)
      .then((res) => res.json())
      .then((p: Problem) => {
        setProblem(p);
        setLanguage(p.languages[0] || 'python');
      });
  }, [problemId]);

  const handleStart = async () => {
    if (!problem || starting) return;
    setStarting(true);

    // Save settings
    localStorage.setItem('interviewpad-settings', JSON.stringify(settings));

    // Create run on server
    const res = await fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        language,
        timeLimitMinutes: settings.timerMinutes,
      }),
    });
    const run = await res.json();

    // Write starter code to disk
    const starterCode = problem.starterCode[language] || '';
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runId: run.id, code: starterCode }),
    });

    // Navigate to active session
    router.push(`/run/${run.id}`);
  };

  if (!problem) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-[#aaa]">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-mono">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const selectedLevel = problem.levels[activeLevel];

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Problem info — full width */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <div className="px-8 py-6">
            {/* Problem header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-mono text-[#999]">
                  {problem.levels.length} levels
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {problem.title}
              </h1>
            </div>

            {/* Level overview — clickable cards */}
            <div className="mb-8">
              <h3 className="text-[10px] font-mono text-[#999] uppercase tracking-widest mb-3">
                Level Overview
              </h3>
              <div className="grid grid-cols-4 gap-1.5">
                {problem.levels.map((level, li) => {
                  const isPassBar = li === 2;
                  const isActive = li === activeLevel;
                  return (
                    <button
                      key={level.level}
                      onClick={() => setActiveLevel(li)}
                      className={`text-left px-3 py-2.5 rounded-md border transition-all ${
                        isActive
                          ? 'border-accent/40 bg-accent/[0.06] ring-1 ring-accent/20'
                          : isPassBar
                          ? 'bg-warning/[0.04] border-warning/15 hover:border-warning/30'
                          : 'bg-surface-2/50 border-border-subtle hover:border-[#444]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono font-bold ${
                          isActive ? 'text-accent' : isPassBar ? 'text-warning' : 'text-[#999]'
                        }`}>
                          L{level.level}
                        </span>
                        {isPassBar && !isActive && (
                          <span className="text-[8px] font-mono text-warning/70 uppercase tracking-wider">
                            pass bar
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        isActive ? 'text-white' : isPassBar ? 'text-[#ccc]' : 'text-[#aaa]'
                      }`}>
                        {level.title}
                      </span>
                      {level.summary && (
                        <p className={`text-[11px] mt-1 leading-snug ${
                          isActive ? 'text-[#888]' : isPassBar ? 'text-warning/60' : 'text-[#888]'
                        }`}>
                          {level.summary}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected level briefing */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-mono text-[#999] uppercase tracking-widest">
                  Level {selectedLevel.level} Briefing
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveLevel(Math.max(0, activeLevel - 1))}
                    disabled={activeLevel === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-border-subtle bg-surface-2/50 text-[#999] hover:text-white hover:border-[#444] transition-colors disabled:opacity-30 disabled:hover:text-[#999] disabled:hover:border-border-subtle"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveLevel(Math.min(problem.levels.length - 1, activeLevel + 1))}
                    disabled={activeLevel === problem.levels.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-border-subtle bg-surface-2/50 text-[#999] hover:text-white hover:border-[#444] transition-colors disabled:opacity-30 disabled:hover:text-[#999] disabled:hover:border-border-subtle"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-surface-1 border border-border rounded-md p-5">
                <Description
                  title={`L${selectedLevel.level}: ${selectedLevel.title}`}
                  markdown={selectedLevel.description}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Config + Start */}
        <div className="w-72 shrink-0 flex flex-col bg-surface-1/50">
          <div className="flex-1 p-6 flex flex-col">
            {/* Language */}
            <div className="mb-6">
              <label className="text-[10px] font-mono text-[#999] uppercase tracking-widest block mb-3">
                Language
              </label>
              <div className="flex gap-2">
                {problem.languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-4 py-2 text-sm font-mono rounded-md transition-colors ${
                      language === lang
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'bg-surface-2 border border-border text-[#999] hover:text-white hover:border-[#444]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="mb-6">
              <label className="text-[10px] font-mono text-[#999] uppercase tracking-widest block mb-3">
                Time Limit
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={settings.timerMinutes}
                  onChange={(e) => setSettings(s => ({ ...s, timerMinutes: parseInt(e.target.value) || 90 }))}
                  className="w-20 bg-surface-2 border border-border text-white text-sm font-mono px-3 py-2 rounded-md outline-none focus:border-accent/50 transition-colors"
                />
                <span className="text-xs text-[#999] font-mono">minutes</span>
              </div>
              <p className="text-[11px] text-[#888] mt-2">
                Standard is 90 min. Timer starts on click.
              </p>
            </div>

            <div className="flex-1" />

            {/* Disclaimer + Start */}
            <div className="border-t border-border pt-6">
              <p className="text-xs text-[#888] leading-relaxed mb-5">
                Timed session. Treat it like the real thing. Your code auto-saves to disk.
              </p>

              <button
                onClick={handleStart}
                disabled={starting}
                className="w-full py-3 bg-accent text-white font-semibold text-sm rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {starting ? 'Creating session...' : 'Start Session'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
