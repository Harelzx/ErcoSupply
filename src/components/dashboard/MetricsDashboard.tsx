'use client';

import { useQuarterData } from '@/hooks/useQuarterData';
import { MonthSummaryCard, MonthSummaryCardSkeleton } from './MonthSummaryCard';
import { QuarterSummary, QuarterSummarySkeleton } from './QuarterSummary';

export function MetricsDashboard() {
  const { state, metrics, loading } = useQuarterData();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map(i => <MonthSummaryCardSkeleton key={i} />)}
        </div>
        <QuarterSummarySkeleton />
      </div>
    );
  }

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
