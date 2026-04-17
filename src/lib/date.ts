const ISRAEL_TZ = 'Asia/Jerusalem';

export function getTodayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ISRAEL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// Reference date for pace and remaining-day calculations. We use *yesterday*
// rather than today because the business day isn't over yet — today's income
// can only be entered after the day ends, so including today as "elapsed"
// would unfairly penalise the user with a 0-income day that isn't actually
// closed. At 00:00 each day the dashboard flips to reflect the day that just
// finished.
export function getReferenceDateISO(now: Date = new Date()): string {
  const todayISO = getTodayISO(now);
  const [y, m, d] = todayISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}
