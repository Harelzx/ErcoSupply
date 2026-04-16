import { describe, it, expect } from 'vitest';
import {
  computeMonthPace,
  computeMonthMetrics,
  computeQuarterMetrics,
  computeUpdatedDailyTarget,
} from './calculator';
import { DayRecord, DayType, MonthData } from './types';

function makeDay(
  date: string,
  dayType: DayType,
  dailyTarget: number,
  actualIncome: number = 0,
): DayRecord {
  return {
    date,
    dayOfWeek: 0,
    hebrewDayName: '',
    dayType,
    isHoliday: false,
    dailyTarget,
    actualIncome,
    note: '',
  };
}

function makeRegularMonth(
  year: number,
  month: number,
  monthlyTarget: number,
  dailyTarget: number,
  incomeByDay: number[] = [],
): MonthData {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: DayRecord[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(makeDay(dateStr, 'regular', dailyTarget, incomeByDay[d - 1] ?? 0));
  }
  return {
    year,
    month,
    hebrewName: 'test',
    monthlyTarget,
    days,
  };
}

describe('computeMonthPace', () => {
  it('returns zeros when month has no monthly target', () => {
    const month = makeRegularMonth(2026, 4, 0, 0);
    const result = computeMonthPace(month, '2026-04-16');
    expect(result.targetToDate).toBe(0);
    expect(result.incomeToDate).toBe(0);
    expect(result.paceAchievementPercent).toBe(0);
  });

  it('returns zero pace, never NaN, when targetToDate is zero', () => {
    const month = makeRegularMonth(2026, 4, 3000, 100);
    const result = computeMonthPace(month, '2026-03-31');
    expect(result.targetToDate).toBe(0);
    expect(result.incomeToDate).toBe(0);
    expect(result.paceAchievementPercent).toBe(0);
    expect(Number.isNaN(result.paceAchievementPercent)).toBe(false);
  });

  it('matches the user scenario: daily target 100, 90 income per day for 16 days → 90%', () => {
    const incomes = Array.from({ length: 30 }, (_, i) => (i < 16 ? 90 : 0));
    const month = makeRegularMonth(2026, 4, 3000, 100, incomes);
    const result = computeMonthPace(month, '2026-04-16');
    expect(result.targetToDate).toBe(1600);
    expect(result.incomeToDate).toBe(1440);
    expect(result.paceAchievementPercent).toBeCloseTo(0.9, 5);
  });

  it('is 100% when income matches target exactly each day', () => {
    const incomes = Array.from({ length: 30 }, (_, i) => (i < 10 ? 100 : 0));
    const month = makeRegularMonth(2026, 4, 3000, 100, incomes);
    const result = computeMonthPace(month, '2026-04-10');
    expect(result.paceAchievementPercent).toBe(1);
  });

  it('does not clamp above 100% when income exceeds target (UI decides)', () => {
    const incomes = Array.from({ length: 30 }, (_, i) => (i < 5 ? 200 : 0));
    const month = makeRegularMonth(2026, 4, 3000, 100, incomes);
    const result = computeMonthPace(month, '2026-04-05');
    expect(result.paceAchievementPercent).toBe(2);
  });

  it('is 0 when today is before the month starts (future month)', () => {
    const incomes = Array.from({ length: 30 }, () => 100);
    const month = makeRegularMonth(2026, 5, 3000, 100, incomes);
    const result = computeMonthPace(month, '2026-04-30');
    expect(result.targetToDate).toBe(0);
    expect(result.incomeToDate).toBe(0);
    expect(result.paceAchievementPercent).toBe(0);
  });

  it('equals full-month pace when today is after month end (past month)', () => {
    const incomes = Array.from({ length: 30 }, () => 90);
    const month = makeRegularMonth(2026, 4, 3000, 100, incomes);
    const result = computeMonthPace(month, '2026-06-01');
    expect(result.targetToDate).toBe(3000);
    expect(result.incomeToDate).toBe(2700);
    expect(result.paceAchievementPercent).toBeCloseTo(0.9, 5);
  });

  it('includes today (inclusive) in the cumulative window', () => {
    const incomes = Array.from({ length: 30 }, (_, i) => (i < 3 ? 50 : 0));
    const month = makeRegularMonth(2026, 4, 3000, 100, incomes);
    const result = computeMonthPace(month, '2026-04-03');
    expect(result.targetToDate).toBe(300);
    expect(result.incomeToDate).toBe(150);
    expect(result.paceAchievementPercent).toBe(0.5);
  });

  it('ignores closed days in targetToDate (their dailyTarget is 0)', () => {
    const days: DayRecord[] = [
      makeDay('2026-04-01', 'regular', 100, 80),
      makeDay('2026-04-02', 'regular', 100, 80),
      makeDay('2026-04-03', 'closed', 0, 0),
      makeDay('2026-04-04', 'regular', 100, 80),
    ];
    const month: MonthData = {
      year: 2026, month: 4, hebrewName: 'test', monthlyTarget: 2500, days,
    };
    const result = computeMonthPace(month, '2026-04-04');
    expect(result.targetToDate).toBe(300);
    expect(result.incomeToDate).toBe(240);
    expect(result.paceAchievementPercent).toBeCloseTo(0.8, 5);
  });

  it('counts half days at half target', () => {
    const days: DayRecord[] = [
      makeDay('2026-04-01', 'regular', 100, 100),
      makeDay('2026-04-02', 'half', 50, 50),
      makeDay('2026-04-03', 'regular', 100, 100),
    ];
    const month: MonthData = {
      year: 2026, month: 4, hebrewName: 'test', monthlyTarget: 2500, days,
    };
    const result = computeMonthPace(month, '2026-04-03');
    expect(result.targetToDate).toBe(250);
    expect(result.incomeToDate).toBe(250);
    expect(result.paceAchievementPercent).toBe(1);
  });
});

describe('computeMonthMetrics with today', () => {
  it('includes pace fields alongside existing metrics', () => {
    const incomes = Array.from({ length: 30 }, (_, i) => (i < 16 ? 90 : 0));
    const month = makeRegularMonth(2026, 4, 3000, 100, incomes);
    const m = computeMonthMetrics(month, '2026-04-16');
    expect(m.paceAchievementPercent).toBeCloseTo(0.9, 5);
    expect(m.targetToDate).toBe(1600);
    expect(m.incomeToDate).toBe(1440);
    expect(m.totalTarget).toBe(3000);
    expect(m.totalIncome).toBe(1440);
    expect(m.achievementPercent).toBeCloseTo(1440 / 3000, 5);
  });
});

describe('computeQuarterMetrics with today', () => {
  it('aggregates pace across past, current, and future months', () => {
    const m1 = makeRegularMonth(
      2026, 4, 3000, 100,
      Array.from({ length: 30 }, () => 90),
    );
    const m2 = makeRegularMonth(
      2026, 5, 3100, 100,
      Array.from({ length: 31 }, (_, i) => (i < 10 ? 80 : 0)),
    );
    const m3 = makeRegularMonth(
      2026, 6, 3000, 100,
      Array.from({ length: 30 }, () => 100),
    );
    const today = '2026-05-10';
    const q = computeQuarterMetrics([m1, m2, m3], today);
    // m1: full past month → 3000 target / 2700 income
    // m2: days 1..10 → 1000 target / 800 income
    // m3: future → 0 / 0
    expect(q.targetToDate).toBe(4000);
    expect(q.incomeToDate).toBe(3500);
    expect(q.paceAchievementPercent).toBeCloseTo(3500 / 4000, 5);
    expect(q.totalTarget).toBe(9100);
    expect(q.totalIncome).toBe(2700 + 800 + 3000);
  });

  it('returns zero pace for an all-future quarter', () => {
    const m1 = makeRegularMonth(2026, 10, 3000, 100);
    const m2 = makeRegularMonth(2026, 11, 3000, 100);
    const m3 = makeRegularMonth(2026, 12, 3000, 100);
    const q = computeQuarterMetrics([m1, m2, m3], '2026-04-16');
    expect(q.targetToDate).toBe(0);
    expect(q.paceAchievementPercent).toBe(0);
  });
});

describe('computeUpdatedDailyTarget', () => {
  it('spreads the gap across days strictly after today, not after last income entry', () => {
    // 10 effective days, target 1000, daily 100. Income for days 1..5 = 80 each
    // (behind pace). Today = day 5. Remaining = days 6..10 = 5 days.
    // Gap = 1000 - 400 = 600. Updated = 600 / 5 = 120 (higher than 100) ✓
    const incomes = Array.from({ length: 10 }, (_, i) => (i < 5 ? 80 : 0));
    const month = makeRegularMonth(2026, 4, 1000, 100, incomes);
    // trim to 10 days for cleanliness
    month.days = month.days.slice(0, 10);
    const result = computeUpdatedDailyTarget(month, '2026-04-05');
    expect(result.remainingGap).toBe(600);
    expect(result.remainingEffectiveDays).toBe(5);
    expect(result.updatedRegularTarget).toBe(120);
  });

  it('does NOT use last-income-index: gaps in income entries still count as elapsed', () => {
    // The old behavior found the last day with income > 0 and treated every
    // day after it as "remaining". That over-counted remaining days when the
    // user skipped entering income for recent days.
    // 10 days, daily 100, income only on day 1 = 80. Today = day 5.
    // Old logic: remaining = days 2..10 = 9 days → updated = 920/9 ≈ 102
    // New logic: remaining = days 6..10 = 5 days → updated = 920/5 = 184
    const incomes = Array.from({ length: 10 }, (_, i) => (i === 0 ? 80 : 0));
    const month = makeRegularMonth(2026, 4, 1000, 100, incomes);
    month.days = month.days.slice(0, 10);
    const result = computeUpdatedDailyTarget(month, '2026-04-05');
    expect(result.remainingEffectiveDays).toBe(5);
    expect(result.updatedRegularTarget).toBe(184);
  });

  it('updated target equals original when on pace (gap matches what remaining days need)', () => {
    // 10 days, daily 100, on-pace income of 100 per day for days 1..5.
    // Gap = 500, remaining = 5 days, updated = 100. Same as original ✓
    const incomes = Array.from({ length: 10 }, (_, i) => (i < 5 ? 100 : 0));
    const month = makeRegularMonth(2026, 4, 1000, 100, incomes);
    month.days = month.days.slice(0, 10);
    const result = computeUpdatedDailyTarget(month, '2026-04-05');
    expect(result.updatedRegularTarget).toBe(100);
  });

  it('updated target is lower than original when ahead of pace', () => {
    // 10 days, daily 100. Income 150 per day for days 1..5 (ahead).
    // Gap = 250, remaining = 5 days, updated = 50 < 100 ✓
    const incomes = Array.from({ length: 10 }, (_, i) => (i < 5 ? 150 : 0));
    const month = makeRegularMonth(2026, 4, 1000, 100, incomes);
    month.days = month.days.slice(0, 10);
    const result = computeUpdatedDailyTarget(month, '2026-04-05');
    expect(result.updatedRegularTarget).toBe(50);
  });

  it('returns zeros when gap is already met', () => {
    const incomes = Array.from({ length: 10 }, (_, i) => (i < 5 ? 250 : 0));
    const month = makeRegularMonth(2026, 4, 1000, 100, incomes);
    month.days = month.days.slice(0, 10);
    const result = computeUpdatedDailyTarget(month, '2026-04-05');
    expect(result.remainingGap).toBeLessThanOrEqual(0);
    expect(result.updatedRegularTarget).toBe(0);
    expect(result.updatedHalfTarget).toBe(0);
  });

  it('returns zeros when no days remain (today is past month end)', () => {
    const incomes = Array.from({ length: 10 }, (_, i) => (i < 5 ? 80 : 0));
    const month = makeRegularMonth(2026, 4, 1000, 100, incomes);
    month.days = month.days.slice(0, 10);
    const result = computeUpdatedDailyTarget(month, '2026-12-31');
    expect(result.remainingEffectiveDays).toBe(0);
    expect(result.updatedRegularTarget).toBe(0);
  });

  it('handles half days at half target', () => {
    const days: DayRecord[] = [
      makeDay('2026-04-01', 'regular', 100, 80),
      makeDay('2026-04-02', 'regular', 100, 80),
      makeDay('2026-04-03', 'half', 50, 0),
      makeDay('2026-04-04', 'regular', 100, 0),
    ];
    const month: MonthData = {
      year: 2026, month: 4, hebrewName: 'test', monthlyTarget: 350, days,
    };
    // Today = day 2. Remaining = day 3 (half) + day 4 (regular) = 1.5 effective
    // Gap = 350 - 160 = 190. Updated = 190 / 1.5 ≈ 126.67
    const result = computeUpdatedDailyTarget(month, '2026-04-02');
    expect(result.remainingEffectiveDays).toBe(1.5);
    expect(result.updatedRegularTarget).toBeCloseTo(126.67, 1);
    expect(result.updatedHalfTarget).toBeCloseTo(63.34, 1);
  });
});
