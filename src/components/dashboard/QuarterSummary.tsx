'use client';

import { QuarterMetrics } from '@/lib/types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import { ProgressRing } from './ProgressRing';
import { QUARTER_LABELS } from '@/lib/constants';

interface QuarterSummaryProps {
  metrics: QuarterMetrics;
  quarter: 1 | 2 | 3 | 4;
  year: number;
}

function quarterPaceColorClasses(percent: number): { dot: string; text: string } {
  if (percent >= 1) return { dot: 'bg-gold', text: 'text-gold' };
  if (percent >= 0.8) return { dot: 'bg-gold-light', text: 'text-gold-light' };
  return { dot: 'bg-terracotta-light', text: 'text-terracotta-light' };
}

export function QuarterSummary({ metrics, quarter, year }: QuarterSummaryProps) {
  const hasTarget = metrics.totalTarget > 0;
  const gap = metrics.totalIncome - metrics.totalTarget;
  const showPace = hasTarget && metrics.targetToDate > 0;
  const paceColors = showPace ? quarterPaceColorClasses(metrics.paceAchievementPercent) : null;

  return (
    <div className="bg-teal rounded-2xl shadow-warm-lg p-5 text-cream">
      {/* Top: Title + Progress Ring */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-gold" />
          <div>
            <h3 className="text-base font-bold text-white">סיכום רבעוני</h3>
            <p className="text-sm text-cream/70">{QUARTER_LABELS[quarter]} · {year}</p>
          </div>
        </div>

        {hasTarget && (
          <ProgressRing
            percent={metrics.achievementPercent}
            size={90}
            strokeWidth={7}
            color={metrics.achievementPercent >= 1 ? '#D4AD5E' : metrics.achievementPercent >= 0.8 ? '#C6963C' : '#D4896A'}
            bgColor="rgba(255,255,255,0.15)"
          />
        )}
      </div>

      {/* Bottom: Stats in a clear row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 border-t border-cream/20 pt-5">
        <div className="text-center min-w-0">
          <p className="text-xs sm:text-sm text-gold-light font-semibold mb-2">יעד רבעוני</p>
          <p className="text-xl sm:text-2xl font-extrabold tabular-nums text-white" title={hasTarget ? formatCurrency(metrics.totalTarget) : ''}>
            {hasTarget ? formatCurrencyCompact(metrics.totalTarget) : '—'}
          </p>
        </div>
        <div className="text-center min-w-0">
          <p className="text-xs sm:text-sm text-gold-light font-semibold mb-2">הכנסה מצטברת</p>
          <p className="text-xl sm:text-2xl font-extrabold tabular-nums text-white" title={metrics.totalIncome > 0 ? formatCurrency(metrics.totalIncome) : ''}>
            {metrics.totalIncome > 0 ? formatCurrencyCompact(metrics.totalIncome) : '—'}
          </p>
        </div>
        <div className="text-center min-w-0">
          <p className="text-xs sm:text-sm text-gold-light font-semibold mb-2">פער</p>
          <p
            className={`text-xl sm:text-2xl font-extrabold tabular-nums ${
              hasTarget && metrics.totalIncome > 0
                ? (gap >= 0 ? 'text-gold' : 'text-terracotta-light')
                : 'text-cream/40'
            }`}
            title={hasTarget && metrics.totalIncome > 0 ? formatCurrency(gap) : ''}
          >
            {hasTarget && metrics.totalIncome > 0 ? formatCurrencyCompact(gap) : '—'}
          </p>
        </div>
      </div>

      {showPace && paceColors && (
        <div className="mt-4 pt-4 border-t border-cream/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${paceColors.dot}`} aria-hidden="true" />
            <div>
              <p className="text-sm text-gold-light font-semibold">עמידה עד כה</p>
              <p className="text-xs text-cream/70 tabular-nums" dir="ltr" title={`${formatCurrency(metrics.incomeToDate)} / ${formatCurrency(metrics.targetToDate)}`}>
                {formatCurrencyCompact(metrics.incomeToDate)} / {formatCurrencyCompact(metrics.targetToDate)}
              </p>
            </div>
          </div>
          <span className={`text-3xl font-extrabold tabular-nums ${paceColors.text}`} dir="ltr">
            {Math.round(metrics.paceAchievementPercent * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
