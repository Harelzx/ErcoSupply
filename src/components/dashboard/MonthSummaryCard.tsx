'use client';

import { MonthData, MonthMetrics } from '@/lib/types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import { ProgressRing } from './ProgressRing';

interface MonthSummaryCardProps {
  month: MonthData;
  metrics: MonthMetrics;
}

export function MonthSummaryCard({ month, metrics }: MonthSummaryCardProps) {
  const hasTarget = month.monthlyTarget > 0;

  return (
    <div className="bg-white rounded-2xl shadow-warm border border-sand-dark/30 p-5 transition-all hover:shadow-warm-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-teal">{month.hebrewName}</h3>
          <p className="text-xs text-warm-gray mt-0.5">
            {metrics.effectiveDays} ימי עבודה אפקטיביים
          </p>
        </div>
        {hasTarget && <ProgressRing percent={metrics.achievementPercent} size={64} strokeWidth={5} />}
      </div>

      {/* Stats */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-warm-gray">יעד חודשי</span>
          <span className="text-sm font-bold text-teal tabular-nums" dir="ltr">
            {hasTarget ? formatCurrencyCompact(month.monthlyTarget) : '—'}
          </span>
        </div>
        <div className="h-px bg-sand-dark/20" />
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-warm-gray">הכנסה בפועל</span>
          <span className={`text-sm font-bold tabular-nums ${metrics.totalIncome > 0 ? 'text-teal' : 'text-warm-gray-light'}`} dir="ltr">
            {metrics.totalIncome > 0 ? formatCurrencyCompact(metrics.totalIncome) : '—'}
          </span>
        </div>
        <div className="h-px bg-sand-dark/20" />
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-warm-gray">פער</span>
          <span
            className={`text-sm font-bold tabular-nums ${
              hasTarget && metrics.totalIncome > 0
                ? (metrics.totalIncome >= month.monthlyTarget ? 'text-teal-light' : 'text-terracotta')
                : 'text-warm-gray-light'
            }`}
            dir="ltr"
          >
            {hasTarget && metrics.totalIncome > 0
              ? formatCurrencyCompact(metrics.totalIncome - month.monthlyTarget)
              : '—'}
          </span>
        </div>
        {hasTarget && metrics.totalIncome > 0 && metrics.updatedRegularTarget > 0 && (
          <>
            <div className="h-px bg-gold/30" />
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gold-dark font-medium">יעד יומי מעודכן</span>
              <span className="text-sm font-bold tabular-nums text-gold-dark" dir="ltr">
                {formatCurrencyCompact(metrics.updatedRegularTarget)}
              </span>
            </div>
            <p className="text-[10px] text-warm-gray">
              {metrics.remainingEffectiveDays} ימים נותרו
            </p>
          </>
        )}
      </div>
    </div>
  );
}
