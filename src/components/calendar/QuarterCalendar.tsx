'use client';

import { useQuarterData } from '@/hooks/useQuarterData';
import { MonthCalendar, MonthCalendarSkeleton } from './MonthCalendar';

export function QuarterCalendar() {
  const { state, setDayType, setActualIncome, setNote, loading } = useQuarterData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => <MonthCalendarSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {state.months.map((month) => (
        <MonthCalendar
          key={`${month.year}-${month.month}`}
          month={month}
          onDayTypeChange={setDayType}
          onIncomeChange={setActualIncome}
          onNoteChange={setNote}
        />
      ))}
    </div>
  );
}
