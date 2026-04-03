'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  startedAt: number;
  timeLimit: number; // seconds
  onExpire: () => void;
  expired: boolean;
  paused?: boolean;
}

export default function Timer({ startedAt, timeLimit, onExpire, expired, paused }: TimerProps) {
  const [remaining, setRemaining] = useState(timeLimit);
  const [showWarning, setShowWarning] = useState(false);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Reset expired ref when props change
  useEffect(() => {
    expiredRef.current = expired;
  }, [expired]);

  // Sync remaining when timeLimit changes (e.g., settings update before start)
  useEffect(() => {
    if (!startedAt) {
      setRemaining(timeLimit);
    }
  }, [timeLimit, startedAt]);

  const warningShownRef = useRef(false);

  useEffect(() => {
    if (expired || !startedAt || paused) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, timeLimit - elapsed);
      setRemaining(left);

      if (left <= 60 && !warningShownRef.current) {
        warningShownRef.current = true;
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }

      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, timeLimit, expired, paused]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isDanger = remaining <= 60;
  const isWarning = remaining <= 600 && !isDanger;

  return (
    <>
      <div
        className={`font-mono text-sm tabular-nums tracking-wide transition-colors duration-500 ${
          isDanger
            ? 'text-danger animate-timer-pulse'
            : isWarning
            ? 'text-warning'
            : 'text-foreground-secondary'
        }`}
      >
        {display}
      </div>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/85 pointer-events-none animate-fade-in">
          <div className="bg-danger text-white px-8 py-4 text-xl font-bold font-mono animate-timer-pulse">
            60 seconds remaining
          </div>
        </div>
      )}
    </>
  );
}
