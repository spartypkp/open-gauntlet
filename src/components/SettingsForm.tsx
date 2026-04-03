'use client';

import type { SessionSettings } from '@/hooks/useSession';

interface SettingsFormProps {
  settings: SessionSettings;
  onUpdate: (settings: Partial<SessionSettings>) => void;
  disabled?: boolean;
  inSession?: boolean;
}

export default function SettingsForm({ settings, onUpdate, disabled, inSession }: SettingsFormProps) {
  return (
    <div className="space-y-3">
      {/* Font Size */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-foreground-secondary">Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={10}
            max={24}
            value={settings.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-14 accent-accent"
            disabled={disabled}
          />
          <span className="text-[10px] text-foreground-secondary font-mono tabular-nums w-4 text-right">{settings.fontSize}</span>
        </div>
      </div>

      {/* Autocomplete */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-foreground-secondary">Autocomplete</label>
        <button
          onClick={() => onUpdate({ autocomplete: !settings.autocomplete })}
          className={`w-9 h-5 rounded-full transition-colors relative ${
            settings.autocomplete ? 'bg-accent' : 'bg-surface-3 border border-border'
          }`}
          disabled={disabled}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              settings.autocomplete ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Keybindings - only show if not in session */}
      {!inSession && (
        <div className="flex items-center justify-between">
          <label className="text-xs text-foreground-secondary">Keybindings</label>
          <select
            value={settings.keybindings}
            onChange={(e) => onUpdate({ keybindings: e.target.value as 'default' | 'vim' | 'emacs' })}
            className="bg-surface-3 text-foreground text-xs font-mono px-2 py-1 outline-none border border-border focus:border-accent/50 transition-colors"
            disabled={disabled}
          >
            <option value="default">Default</option>
            <option value="vim">Vim</option>
            <option value="emacs">Emacs</option>
          </select>
        </div>
      )}
    </div>
  );
}
