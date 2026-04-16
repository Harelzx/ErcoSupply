import { DayRecord, DayType, MonthData, MonthMetrics, QuarterMetrics } from './types';
import { HEBREW_DAY_NAMES, HEBREW_MONTH_NAMES, QUARTER_MONTHS } from './constants';
import { getIsraeliHolidays } from './holidays';
import { getTodayISO } from './date';

export interface MonthPace {
  targetToDate: number;
  incomeToDate: number;
  paceAchievementPercent: number;
}

export function computeMonthPace(month: MonthData, today: string): MonthPace {
  let targetToDate = 0;
  let incomeToDate = 0;
  for (const day of month.days) {
    if (day.date > today) break;
    targetToDate += day.dailyTarget;
    incomeToDate += day.actualIncome;
  }
  return {
    targetToDate,
    incomeToDate,
    paceAchievementPercent: targetToDate > 0 ? incomeToDate / targetToDate : 0,
  };
}

function getDefaultDayType(dayOfWeek: number): DayType {
  if (dayOfWeek === 6) return 'closed'; // Saturday
  if (dayOfWeek === 5) return 'half';   // Friday
  return 'regular';                      // Sunday-Thursday
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function generateMonthDays(year: number, month: number, holidays: Map<string, { name: string; dayType: DayType }>): DayRecord[] {
  const daysInMonth = getDaysInMonth(year, month);
  const days: DayRecord[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dayOfWeek = date.getDay();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const holiday = holidays.get(dateStr);
    let dayType = getDefaultDayType(dayOfWeek);
    let isHoliday = false;
    let holidayName: string | undefined;

    if (holiday) {
      isHoliday = true;
      holidayName = holiday.name;
      // Holiday overrides default only if it's more restrictive
      if (holiday.dayType === 'closed') {
        dayType = 'closed';
      } else if (holiday.dayType === 'half' && dayType === 'regular') {
        dayType = 'half';
      }
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      hebrewDayName: HEBREW_DAY_NAMES[dayOfWeek],
      dayType,
      isHoliday,
      holidayName,
      dailyTarget: 0,
      actualIncome: 0,
      note: '',
    });
  }

  return days;
}

export function calculateDailyTargets(days: DayRecord[], monthlyTarget: number): DayRecord[] {
  const effectiveDays = days.reduce((sum, day) => {
    if (day.dayType === 'regular') return sum + 1;
    if (day.dayType === 'half') return sum + 0.5;
    return sum;
  }, 0);

  if (effectiveDays === 0) {
    return days.map(day => ({ ...day, dailyTarget: 0 }));
  }

  const regularDayTarget = monthlyTarget / effectiveDays;

  return days.map(day => ({
    ...day,
    dailyTarget:
      day.dayType === 'regular' ? Math.round(regularDayTarget * 100) / 100 :
      day.dayType === 'half' ? Math.round((regularDayTarget / 2) * 100) / 100 :
      0,
  }));
}

export function generateQuarterData(
  quarter: 1 | 2 | 3 | 4,
  year: number,
  monthlyTargets: [number, number, number],
  existingMonths?: [MonthData, MonthData, MonthData],
): [MonthData, MonthData, MonthData] {
  const monthNumbers = QUARTER_MONTHS[quarter];
  const holidays = getIsraeliHolidays(year, [...monthNumbers]);

  return monthNumbers.map((monthNum, idx) => {
    const existingMonth = existingMonths?.[idx];
    let days: DayRecord[];

    if (existingMonth && existingMonth.year === year && existingMonth.month === monthNum) {
      // Preserve user's day types and income data
      days = generateMonthDays(year, monthNum, holidays).map(newDay => {
        const existingDay = existingMonth.days.find(d => d.date === newDay.date);
        if (existingDay) {
          return {
            ...newDay,
            dayType: existingDay.dayType,
            actualIncome: existingDay.actualIncome,
            note: existingDay.note,
          };
        }
        return newDay;
      });
    } else {
      days = generateMonthDays(year, monthNum, holidays);
    }

    days = calculateDailyTargets(days, monthlyTargets[idx]);

    return {
      year,
      month: monthNum,
      hebrewName: HEBREW_MONTH_NAMES[monthNum - 1],
      monthlyTarget: monthlyTargets[idx],
      days,
    };
  }) as [MonthData, MonthData, MonthData];
}

export function computeMonthMetrics(month: MonthData, today: string = getTodayISO()): MonthMetrics {
  const effectiveDays = month.days.reduce((sum, day) => {
    if (day.dayType === 'regular') return sum + 1;
    if (day.dayType === 'half') return sum + 0.5;
    return sum;
  }, 0);

  const totalTarget = month.days.reduce((sum, day) => sum + day.dailyTarget, 0);
  const totalIncome = month.days.reduce((sum, day) => sum + day.actualIncome, 0);
  const updated = computeUpdatedDailyTarget(month);
  const pace = computeMonthPace(month, today);

  return {
    effectiveDays,
    totalTarget,
    totalIncome,
    achievementPercent: month.monthlyTarget > 0 ? totalIncome / month.monthlyTarget : 0,
    remainingGap: updated.remainingGap,
    remainingEffectiveDays: updated.remainingEffectiveDays,
    updatedRegularTarget: updated.updatedRegularTarget,
    updatedHalfTarget: updated.updatedHalfTarget,
    targetToDate: pace.targetToDate,
    incomeToDate: pace.incomeToDate,
    paceAchievementPercent: pace.paceAchievementPercent,
  };
}

export function computeQuarterMetrics(
  months: [MonthData, MonthData, MonthData],
  today: string = getTodayISO(),
): QuarterMetrics {
  const monthMetrics = months.map((m) => computeMonthMetrics(m, today));
  const totalTarget = months.reduce((sum, m) => sum + m.monthlyTarget, 0);
  const totalIncome = monthMetrics.reduce((sum, m) => sum + m.totalIncome, 0);
  const targetToDate = monthMetrics.reduce((sum, m) => sum + m.targetToDate, 0);
  const incomeToDate = monthMetrics.reduce((sum, m) => sum + m.incomeToDate, 0);

  return {
    totalTarget,
    totalIncome,
    achievementPercent: totalTarget > 0 ? totalIncome / totalTarget : 0,
    targetToDate,
    incomeToDate,
    paceAchievementPercent: targetToDate > 0 ? incomeToDate / targetToDate : 0,
    monthMetrics,
  };
}

export interface UpdatedTarget {
  remainingGap: number;
  remainingEffectiveDays: number;
  updatedRegularTarget: number;
  updatedHalfTarget: number;
}

export function computeUpdatedDailyTarget(month: MonthData): UpdatedTarget {
  // Find the last day with income entered to determine "remaining" days
  let lastIncomeIndex = -1;
  let totalIncomeToDate = 0;

  for (let i = 0; i < month.days.length; i++) {
    if (month.days[i].actualIncome > 0) {
      lastIncomeIndex = i;
    }
    totalIncomeToDate += month.days[i].actualIncome;
  }

  const remainingGap = month.monthlyTarget - totalIncomeToDate;

  // Count remaining effective days (after last day with income)
  let remainingEffectiveDays = 0;
  const startFrom = lastIncomeIndex + 1;
  for (let i = startFrom; i < month.days.length; i++) {
    const day = month.days[i];
    if (day.dayType === 'regular') remainingEffectiveDays += 1;
    else if (day.dayType === 'half') remainingEffectiveDays += 0.5;
  }

  if (remainingGap <= 0 || remainingEffectiveDays === 0) {
    return {
      remainingGap,
      remainingEffectiveDays,
      updatedRegularTarget: 0,
      updatedHalfTarget: 0,
    };
  }

  const updatedRegularTarget = Math.round((remainingGap / remainingEffectiveDays) * 100) / 100;
  const updatedHalfTarget = Math.round((updatedRegularTarget / 2) * 100) / 100;

  return {
    remainingGap,
    remainingEffectiveDays,
    updatedRegularTarget,
    updatedHalfTarget,
  };
}

export function computeCumulativeRow(month: MonthData, dayIndex: number, quarterMonths: [MonthData, MonthData, MonthData], monthIndex: number) {
  const day = month.days[dayIndex];

  // Cumulative within month
  let cumTarget = 0;
  let cumIncome = 0;
  for (let i = 0; i <= dayIndex; i++) {
    cumTarget += month.days[i].dailyTarget;
    cumIncome += month.days[i].actualIncome;
  }

  // Daily achievement
  const dailyAchievement = day.dailyTarget > 0 ? day.actualIncome / day.dailyTarget : 0;

  // Monthly achievement
  const monthlyAchievement = month.monthlyTarget > 0 ? cumIncome / month.monthlyTarget : 0;

  // Quarterly achievement (all income across all months up to this point)
  let totalQuarterIncome = 0;
  let totalQuarterTarget = 0;
  for (let m = 0; m < monthIndex; m++) {
    totalQuarterIncome += quarterMonths[m].days.reduce((s, d) => s + d.actualIncome, 0);
    totalQuarterTarget += quarterMonths[m].monthlyTarget;
  }
  totalQuarterIncome += cumIncome;
  totalQuarterTarget += month.monthlyTarget;
  const quarterlyAchievement = totalQuarterTarget > 0 ? totalQuarterIncome / totalQuarterTarget : 0;

  return {
    cumTarget,
    cumIncome,
    dailyAchievement,
    monthlyAchievement,
    quarterlyAchievement,
  };
}
