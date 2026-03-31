'use client';

import { useQuarterData } from '@/hooks/useQuarterData';
import { QUARTER_LABELS } from '@/lib/constants';

export function QuarterPicker() {
  const { state, setQuarter } = useQuarterData();
  const { quarter, year } = state.config;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={String(quarter)}
          onChange={(e) => setQuarter(Number(e.target.value) as 1 | 2 | 3 | 4, year)}
          className="h-8 w-[180px] bg-teal-light/20 border border-teal-light/30 text-cream text-sm rounded-lg px-3 pr-8 appearance-none cursor-pointer hover:bg-teal-light/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          {([1, 2, 3, 4] as const).map((q) => (
            <option key={q} value={String(q)} className="bg-teal text-cream">
              {QUARTER_LABELS[q]}
            </option>
          ))}
        </select>
        <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <div className="relative">
        <select
          value={String(year)}
          onChange={(e) => setQuarter(quarter, Number(e.target.value))}
          className="h-8 w-[90px] bg-teal-light/20 border border-teal-light/30 text-cream text-sm rounded-lg px-3 pr-8 appearance-none cursor-pointer hover:bg-teal-light/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          {years.map((y) => (
            <option key={y} value={String(y)} className="bg-teal text-cream">
              {y}
            </option>
          ))}
        </select>
        <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/60 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
