export function formatCurrency(value: number): string {
  // Build the string manually instead of using Intl's `style: 'currency'`,
  // which injects U+200F RTL marks around the ₪ (e.g. "‏948,851 ‏₪"). Those
  // marks reorder the symbol when the string is rendered inside a dir="ltr"
  // box (the reveal bubble, compact cells), making ₪ overlap the digits.
  // A grouped number + non-breaking space + ₪ stays clean and LTR-safe.
  const NBSP = ' ';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const num = new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  return `${sign}${num}${NBSP}₪`;
}

export function formatCurrencyCompact(value: number): string {
  // Use a non-breaking space between the number and ₪ so the symbol
  // never wraps onto its own line in narrow grid cells.
  const NBSP = ' ';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(2)}M${NBSP}₪`;
  }
  if (abs >= 1_000) {
    return `${sign}${Math.round(abs / 1_000)}K${NBSP}₪`;
  }
  return formatCurrency(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
