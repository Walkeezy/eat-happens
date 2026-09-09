import { describe, expect, it } from 'vitest';

import {
  calendarYear,
  displayCalendarDate,
  isValidCalendarDate,
  previousCalendarYearRange,
  todayCalendarDate,
} from './calendar-date';

describe('todayCalendarDate', () => {
  it('returns local today as YYYY-MM-DD', () => {
    const today = todayCalendarDate();

    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isValidCalendarDate(today)).toBe(true);
  });
});

describe('displayCalendarDate', () => {
  it('formats a calendar date in local time without UTC conversion', () => {
    expect(displayCalendarDate('2026-01-01')).toBe('1. Januar 2026');
    expect(displayCalendarDate('2026-09-09')).toBe('9. September 2026');
  });
});

describe('isValidCalendarDate', () => {
  it('accepts real calendar days and rejects invalid values', () => {
    expect(isValidCalendarDate('2026-02-28')).toBe(true);
    expect(isValidCalendarDate('2026-02-31')).toBe(false);
    expect(isValidCalendarDate('not-a-date')).toBe(false);
  });
});

describe('calendarYear', () => {
  it('reads the year from a calendar date string', () => {
    expect(calendarYear('2025-06-01')).toBe(2025);
    expect(calendarYear('2026-01-01')).toBe(2026);
    expect(calendarYear('2026-12-31')).toBe(2026);
  });
});

describe('previousCalendarYearRange', () => {
  it('returns Jan 1 through Dec 31 of the previous calendar year', () => {
    expect(previousCalendarYearRange('2026-09-09')).toEqual({
      year: 2025,
      start: '2025-01-01',
      end: '2025-12-31',
    });
    expect(previousCalendarYearRange('2026-01-01')).toEqual({
      year: 2025,
      start: '2025-01-01',
      end: '2025-12-31',
    });
  });
});
