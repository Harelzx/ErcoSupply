import { HebrewCalendar, HDate, flags } from '@hebcal/core';
import { DayType } from './types';

export interface HolidayInfo {
  name: string;
  dayType: DayType;
}

export function getIsraeliHolidays(year: number, months: number[]): Map<string, HolidayInfo> {
  const holidayMap = new Map<string, HolidayInfo>();

  const events = HebrewCalendar.calendar({
    year,
    isHebrewYear: false,
    il: true,
    candlelighting: false,
    sedrot: false,
    omer: false,
    noMinorFast: false,
    noModern: false,
    noRoshChodesh: true,
    noSpecialShabbat: true,
  });

  for (const ev of events) {
    const date = ev.getDate();
    const gregDate = date.greg();
    const month = gregDate.getMonth() + 1;

    if (!months.includes(month)) continue;

    const f = ev.getFlags();
    const dateStr = formatDateKey(gregDate);
    const name = ev.render('he');

    // Major holidays (Yom Tov) - closed
    if (f & flags.CHAG) {
      holidayMap.set(dateStr, { name, dayType: 'closed' });
      continue;
    }

    // Erev holidays - half day (only if not already set to closed)
    if (f & flags.EREV) {
      if (!holidayMap.has(dateStr) || holidayMap.get(dateStr)!.dayType !== 'closed') {
        holidayMap.set(dateStr, { name, dayType: 'half' });
      }
      continue;
    }

    // Major fasts (Yom Kippur already covered by CHAG, but Tzom Gedaliah, 17 Tammuz, 9 Av etc.)
    if (f & flags.MAJOR_FAST) {
      if (!holidayMap.has(dateStr)) {
        holidayMap.set(dateStr, { name, dayType: 'half' });
      }
      continue;
    }

    // Minor holidays - just mark them but don't change day type
    if (!holidayMap.has(dateStr)) {
      // Store the name for display but keep day as whatever it defaults to
      const existing = holidayMap.get(dateStr);
      if (!existing) {
        holidayMap.set(dateStr, { name, dayType: 'regular' });
      }
    }
  }

  // Remove entries that are just "regular" with a minor holiday name
  // We only want to return entries that actually modify the day type
  const result = new Map<string, HolidayInfo>();
  for (const [key, val] of holidayMap) {
    result.set(key, val);
  }

  return result;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
