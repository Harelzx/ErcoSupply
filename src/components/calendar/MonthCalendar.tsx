'use client';

import { MonthData, DayType } from '@/lib/types';
import { HEBREW_DAY_NAMES } from '@/lib/constants';
import { DayCell } from './DayCell';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthCalendarProps {
  month: MonthData;
  onDayTypeChange: (date: string, dayType: DayType) => void;
  onIncomeChange: (date: string, income: number) => void;
  onNoteChange: (date: string, note: string) => void;
}

export function MonthCalendar({ month, onDayTypeChange, onIncomeChange, onNoteChange }: MonthCalendarProps) {
  // Calculate offset for first day of month (Sunday = 0)
  const firstDayOfWeek = month.days[0]?.dayOfWeek ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-warm-md border border-sand-dark/30 overflow-hidden">
      {/* Month header */}
      <div className="bg-teal px-4 py-3">
        <h3 className="text-base font-bold text-cream">{month.hebrewName} {month.year}</h3>
      </div>

      {/* Day name headers - Sunday to Saturday (RTL: Sunday on right) */}
      <div className="grid grid-cols-7 border-b border-sand-dark/20">
        {HEBREW_DAY_NAMES.map((name, idx) => (
          <div
            key={idx}
            className={`
              text-center text-[11px] font-semibold py-2
              ${idx === 6 ? 'text-terracotta' : idx === 5 ? 'text-gold-dark' : 'text-warm-gray'}
            `}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px bg-sand-dark/10 p-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[90px]" />
        ))}

        {/* Day cells */}
        {month.days.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            month={month}
            onDayTypeChange={onDayTypeChange}
            onIncomeChange={onIncomeChange}
            onNoteChange={onNoteChange}
          />
        ))}
      </div>
    </div>
  );
}

export function MonthCalendarSkeleton() {
  // Approximate a month: ~30 cells in a 7-col grid with a small lead offset.
  const totalCells = 32;
  return (
    <div className="bg-white rounded-2xl shadow-warm-md border border-sand-dark/30 overflow-hidden">
      <div className="bg-teal px-4 py-3">
        <Skeleton className="h-4 w-24 bg-cream/15" />
      </div>
      <div className="grid grid-cols-7 border-b border-sand-dark/20">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-2 flex justify-center">
            <Skeleton className="h-3 w-3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-sand-dark/10 p-1">
        {Array.from({ length: totalCells }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-2 min-h-[90px] flex flex-col gap-1.5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-5 w-full mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
