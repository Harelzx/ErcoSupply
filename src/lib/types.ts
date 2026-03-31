export type DayType = 'regular' | 'half' | 'closed';

export interface DayRecord {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun ... 6=Sat
  hebrewDayName: string;
  dayType: DayType;
  isHoliday: boolean;
  holidayName?: string;
  dailyTarget: number;
  actualIncome: number;
  note: string;
}

export interface MonthData {
  year: number;
  month: number; // 1-12
  hebrewName: string;
  monthlyTarget: number;
  days: DayRecord[];
}

export interface QuarterConfig {
  quarter: 1 | 2 | 3 | 4;
  year: number;
}

export interface MonthMetrics {
  effectiveDays: number;
  totalTarget: number;
  totalIncome: number;
  achievementPercent: number;
  remainingGap: number;
  remainingEffectiveDays: number;
  updatedRegularTarget: number;
  updatedHalfTarget: number;
}

export interface QuarterMetrics {
  totalTarget: number;
  totalIncome: number;
  achievementPercent: number;
  monthMetrics: MonthMetrics[];
}

export type QuarterAction =
  | { type: 'SET_QUARTER'; quarter: 1 | 2 | 3 | 4; year: number }
  | { type: 'SET_MONTHLY_TARGET'; monthIndex: number; target: number }
  | { type: 'SET_DAY_TYPE'; date: string; dayType: DayType }
  | { type: 'SET_ACTUAL_INCOME'; date: string; income: number }
  | { type: 'SET_NOTE'; date: string; note: string };

export interface QuarterState {
  config: QuarterConfig;
  months: [MonthData, MonthData, MonthData];
}
