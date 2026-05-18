'use client';

import { useEffect, useState } from 'react';
import { useQuarterData, SaveErrorInfo } from '@/hooks/useQuarterData';

const JUST_SAVED_MS = 2500;

function formatSavedAgo(savedAt: Date, now: number): string {
  const diffMs = now - savedAt.getTime();
  if (diffMs < JUST_SAVED_MS) return 'נשמר';
  if (diffMs < 60_000) return 'נשמר זה עתה';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `נשמר לפני ${mins} דק׳`;
  const hh = savedAt.getHours().toString().padStart(2, '0');
  const mm = savedAt.getMinutes().toString().padStart(2, '0');
  return `נשמר ב-${hh}:${mm}`;
}

function formatErrorForCopy(err: SaveErrorInfo): string {
  const lines = [
    `time: ${err.timestamp}`,
    `operation: ${err.operation ?? 'unknown'}`,
    `type: ${err.type}`,
    `message: ${err.message}`,
  ];
  if (err.code) lines.push(`code: ${err.code}`);
  if (err.details) lines.push(`details: ${err.details}`);
  if (err.hint) lines.push(`hint: ${err.hint}`);
  return lines.join('\n');
}

function ErrorPill({ err }: { err: SaveErrorInfo }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatErrorForCopy(err));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const localTime = (() => {
    const d = new Date(err.timestamp);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  })();

  return (
    <div
      role="alert"
      className="flex flex-col gap-1 px-3 py-2 rounded-md bg-terracotta/20 border border-terracotta/40 text-cream text-xs max-w-md"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-terracotta-light">
          שגיאת שמירה · {localTime}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="px-2 py-0.5 rounded bg-cream/10 hover:bg-cream/20 text-cream text-[11px] font-medium transition-colors shrink-0"
        >
          {copied ? 'הועתק' : 'העתק פרטים'}
        </button>
      </div>
      <div className="font-mono text-cream/90 break-all leading-snug">
        <div>[{err.type}] {err.message}</div>
        {err.operation && <div className="text-cream/70">פעולה: {err.operation}</div>}
        {err.details && <div className="text-cream/70">details: {err.details}</div>}
        {err.hint && <div className="text-cream/70">hint: {err.hint}</div>}
      </div>
    </div>
  );
}

export function SaveStatus() {
  const { saving, saveError, lastSavedAt } = useQuarterData();
  const [now, setNow] = useState(() => Date.now());

  // Tick after the "just saved" window so the pill transitions to "X ago".
  useEffect(() => {
    if (!lastSavedAt) return;
    const elapsed = Date.now() - lastSavedAt.getTime();
    if (elapsed >= JUST_SAVED_MS) return;
    const t = setTimeout(() => setNow(Date.now()), JUST_SAVED_MS - elapsed);
    return () => clearTimeout(t);
  }, [lastSavedAt]);

  // Keep the relative timestamp fresh while idle.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (saveError) return <ErrorPill err={saveError} />;

  if (saving) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-teal-light/20 text-cream/80 text-xs">
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <span>שומר…</span>
      </div>
    );
  }

  if (lastSavedAt) {
    const isFresh = now - lastSavedAt.getTime() < JUST_SAVED_MS;
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
          isFresh ? 'bg-gold/15 text-cream' : 'bg-cream/5 text-cream/60'
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={isFresh ? 'text-gold' : 'text-cream/40'}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{formatSavedAgo(lastSavedAt, now)}</span>
      </div>
    );
  }

  return null;
}
