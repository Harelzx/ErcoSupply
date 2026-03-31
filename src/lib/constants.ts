import { DayType } from './types';

export const HEBREW_DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] as const;

export const HEBREW_DAY_FULL_NAMES = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת',
] as const;

export const HEBREW_MONTH_NAMES = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
] as const;

export const QUARTER_LABELS = {
  1: 'רבעון 1 (ינו׳-מרץ)',
  2: 'רבעון 2 (אפר׳-יוני)',
  3: 'רבעון 3 (יולי-ספט׳)',
  4: 'רבעון 4 (אוק׳-דצמ׳)',
} as const;

export const QUARTER_MONTHS: Record<1 | 2 | 3 | 4, [number, number, number]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

export const DAY_TYPE_CONFIG: Record<DayType, { label: string; color: string; bgClass: string }> = {
  regular: { label: 'רגיל', color: '#2A6E6A', bgClass: 'day-regular' },
  half: { label: 'חצי', color: '#C6963C', bgClass: 'day-half' },
  closed: { label: 'סגור', color: '#C4704B', bgClass: 'day-closed' },
};

export const DAY_TYPE_CYCLE: DayType[] = ['regular', 'half', 'closed'];

export const COLUMN_HEADERS = [
  'תאריך',
  'יום',
  'סוג יום',
  'יעד יומי',
  'הכנסה בפועל',
  'יעד מצטבר חודשי',
  'הכנסה מצטברת',
  '% עמידה יומי',
  '% עמידה חודשי',
  '% עמידה רבעוני',
  'הערות',
] as const;
