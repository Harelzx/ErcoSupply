import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyCompact } from './format';

// U+200E LRM, U+200F RLM, U+061C ALM, U+2066-2069 isolates — any of these
// embedded by Intl currency formatting reorder the ₪ inside a dir="ltr" box.
const DIRECTIONAL_MARKS = /[‎‏؜⁦⁧⁨⁩]/;
const NBSP = ' ';

describe('formatCurrency', () => {
  it('renders a clean LTR string: grouped number, NBSP, then ₪', () => {
    expect(formatCurrency(948851)).toBe(`948,851${NBSP}₪`);
  });

  it('handles negatives with a leading minus and no marks', () => {
    expect(formatCurrency(-40099)).toBe(`-40,099${NBSP}₪`);
  });

  it('contains no Unicode directional marks (which break the ₪ in LTR boxes)', () => {
    for (const v of [948851, -40099, 0, 1042724, 999]) {
      expect(DIRECTIONAL_MARKS.test(formatCurrency(v))).toBe(false);
    }
  });
});

describe('formatCurrencyCompact', () => {
  it('stays mark-free for both compact and small (full) values', () => {
    for (const v of [3046526, -40099, 65000, 999, -250]) {
      expect(DIRECTIONAL_MARKS.test(formatCurrencyCompact(v))).toBe(false);
    }
  });
});
