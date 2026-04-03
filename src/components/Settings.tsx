'use client';

import { useState } from 'react';
import type { SessionSettings } from '@/hooks/useSession';
import SettingsForm from '@/components/SettingsForm';

interface SettingsProps {
  settings: SessionSettings;
  onUpdate: (settings: Partial<SessionSettings>) => void;
  disabled?: boolean;
  inSession?: boolean;
}

export default function Settings({ settings, onUpdate, disabled, inSession }: SettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 flex items-center justify-center hover:bg-surface-2 transition-colors text-[#aaa] hover:text-foreground"
        title="Settings"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 w-56 bg-surface-2 border border-border shadow-xl p-4 space-y-3 animate-slide-down">
            <h3 className="text-[10px] font-mono text-[#aaa] uppercase tracking-widest">Settings</h3>
            <SettingsForm settings={settings} onUpdate={onUpdate} disabled={disabled} inSession={inSession} />
          </div>
        </>
      )}
    </div>
  );
}
