import { describe, it, expect } from 'vitest';
import {
  computeMonthPace,
  computeMonthMetrics,
  computeQuarterMetrics,
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
