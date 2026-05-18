'use client';

import { useQuarterData } from '@/hooks/useQuarterData';

export function SaveStatus() {
  const { saving, saveError } = useQuarterData();

  if (saveError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 px-3 py-1.5 rounded-md bg-terracotta/20 border border-terracotta/40 text-cream text-xs max-w-md"
      >
        <span className="font-bold text-terracotta-light shrink-0">שגיאת שמירה</span>
        <span className="font-mono text-cream/90 break-all">
          [{saveError.type}] {saveError.message}
          {saveError.details ? ` · ${saveError.details}` : ''}
          {saveError.hint ? ` · hint: ${saveError.hint}` : ''}
        </span>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-teal-light/20 text-cream/80 text-xs">
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <span>שומר…</span>
      </div>
    );
  }

  return null;
}
