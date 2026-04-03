'use client';

import { useState, useEffect } from 'react';
import type { Problem } from '@/types';
import type { SessionSettings } from '@/hooks/useSession';
import Description from '@/components/Description';
import ICFGuide from '@/components/ICFGuide';
import SettingsForm from '@/components/SettingsForm';

interface DescriptionPanelProps {
  activeTab: 'description' | 'rules' | 'settings';
  problem: Problem;
  currentLevel: number;
  completedLevels: number[];
  settings: SessionSettings;
  onUpdateSettings: (settings: Partial<SessionSettings>) => void;
  disabled?: boolean;
  reviewMode?: boolean;
}

export default function DescriptionPanel({
  activeTab,
  problem,
  currentLevel,
  completedLevels,
  settings,
  onUpdateSettings,
  disabled,
  reviewMode,
}: DescriptionPanelProps) {
  const [viewingLevel, setViewingLevel] = useState(currentLevel);

  // Auto-switch to current level when it changes (e.g. after passing)
  useEffect(() => {
    setViewingLevel(currentLevel);
  }, [currentLevel]);

  const accessibleLevels = reviewMode
    ? problem.levels
    : problem.levels.filter((l) => l.level <= currentLevel);

  const activeLevel = problem.levels.find((l) => l.level === viewingLevel);

  return (
    <div className="flex-1 overflow-auto min-w-0 flex flex-col">
      {activeTab === 'description' && (
        <>
          {/* Level tabs */}
          <div className="flex border-b border-border shrink-0">
            {accessibleLevels.map((level) => {
              const isActive = level.level === viewingLevel;
              const isCompleted = completedLevels.includes(level.level);
              return (
                <button
                  key={level.level}
                  onClick={() => setViewingLevel(level.level)}
                  className={`px-4 py-2 text-xs font-mono transition-colors relative ${
                    isActive
                      ? 'text-foreground'
                      : 'text-[#666] hover:text-[#aaa]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isCompleted && <span className="text-success text-[10px]">&#10003;</span>}
                    L{level.level}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Level content */}
          <div className="flex-1 overflow-auto p-4">
            {activeLevel && (
              <Description title={activeLevel.title} markdown={activeLevel.description} />
            )}
          </div>
        </>
      )}

      {activeTab === 'rules' && (
        <ICFGuide />
      )}

      {activeTab === 'settings' && (
        <div className="p-4">
          <p className="text-[10px] font-mono text-[#aaa] uppercase tracking-widest mb-4">Settings</p>
          <SettingsForm
            settings={settings}
            onUpdate={onUpdateSettings}
            disabled={disabled}
            inSession
          />
        </div>
      )}
    </div>
  );
}
