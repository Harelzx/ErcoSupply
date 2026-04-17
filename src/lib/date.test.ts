import { describe, it, expect } from 'vitest';
import { getTodayISO, getReferenceDateISO } from './date';

describe('getTodayISO', () => {
  it('returns the Israel-local date for a given instant', () => {
    // 2026-04-17 10:00 UTC = 13:00 Asia/Jerusalem (DST), still April 17
    const now = new Date('2026-04-17T10:00:00Z');
    expect(getTodayISO(now)).toBe('2026-04-17');
  });
});

describe('getReferenceDateISO', () => {
  it('returns yesterday in Israel time', () => {
    const now = new Date('2026-04-17T10:00:00Z');
    expect(getReferenceDateISO(now)).toBe('2026-04-16');
  });

  it('crosses month boundary correctly', () => {
    const now = new Date('2026-05-01T09:00:00Z');
    expect(getReferenceDateISO(now)).toBe('2026-04-30');
  });

  it('crosses year boundary correctly', () => {
    const now = new Date('2027-01-01T09:00:00Z');
    expect(getReferenceDateISO(now)).toBe('2026-12-31');
  });

  it('handles leap-year Feb 29 → Feb 28 shift', () => {
    const now = new Date('2028-03-01T09:00:00Z');
    expect(getReferenceDateISO(now)).toBe('2028-02-29');
  });
});
