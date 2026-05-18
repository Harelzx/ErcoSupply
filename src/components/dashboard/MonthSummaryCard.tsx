'use client';

import { MonthData, MonthMetrics } from '@/lib/types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import { ProgressRing } from './ProgressRing';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthSummaryCardProps {
  month: MonthData;
  metrics: MonthMetrics;
}

function paceColorClasses(percent: number): { dot: string; text: string } {
  if (percent >= 1) return { dot: 'bg-teal', text: 'text-teal' };
  if (percent >= 0.8) return { dot: 'bg-gold-dark', text: 'text-gold-dark' };
  return { dot: 'bg-terracotta', text: 'text-terracotta' };
}

export function MonthSummaryCard({ month, metrics }: MonthSummaryCardProps) {
  const hasTarget = month.monthlyTarget > 0;
  const showPace = hasTarget && metrics.targetToDate > 0;
  const paceColors = showPace ? paceColorClasses(metrics.paceAchievementPercent) : null;

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
        {showPace && paceColors && (
          <>
            <div className="h-px bg-sand-dark/40" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-teal flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${paceColors.dot}`} aria-hidden="true" />
                עמידה עד כה
              </span>
              <span className={`text-sm font-extrabold tabular-nums ${paceColors.text}`} dir="ltr">
                {Math.round(metrics.paceAchievementPercent * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-warm-gray">יעד עד כה</span>
              <span className="text-[10px] tabular-nums text-warm-gray" dir="ltr">
                {formatCurrencyCompact(metrics.incomeToDate)} / {formatCurrencyCompact(metrics.targetToDate)}
              </span>
            </div>
          </>
        )}
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

export function MonthSummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-warm border border-sand-dark/30 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2].map(i => (
          <div key={i}>
            <div className="flex justify-between items-baseline">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            {i < 2 && <div className="h-px bg-sand-dark/20 mt-2.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}
