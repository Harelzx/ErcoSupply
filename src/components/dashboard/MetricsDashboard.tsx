'use client';

import { useQuarterData } from '@/hooks/useQuarterData';
import { MonthSummaryCard } from './MonthSummaryCard';
import { QuarterSummary } from './QuarterSummary';

export function MetricsDashboard() {
  const { state, metrics } = useQuarterData();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {state.months.map((month, idx) => (
          <MonthSummaryCard
            key={`${month.year}-${month.month}`}
            month={month}
            metrics={metrics.monthMetrics[idx]}
          />
        ))}
      </div>
      <QuarterSummary
        metrics={metrics}
        quarter={state.config.quarter}
        year={state.config.year}
      />
    </div>
  );
}
