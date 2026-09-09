import { describe, expect, it } from 'vitest';

import {
  calendarYear,
  calendarYearRange,
  displayCalendarDate,
  isClosedCalendarYear,
  isJanuary,
  isValidCalendarDate,
  parseYearParam,
  previousCalendarYearRange,
  resolveStatisticsYear,
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

describe('calendarYearRange', () => {
  it('returns Jan 1 through Dec 31 of the given year', () => {
    expect(calendarYearRange(2024)).toEqual({
      year: 2024,
      start: '2024-01-01',
      end: '2024-12-31',
    });
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

describe('isClosedCalendarYear', () => {
  it('treats years before the current calendar year as closed', () => {
    expect(isClosedCalendarYear(2025, '2026-09-09')).toBe(true);
    expect(isClosedCalendarYear(2026, '2026-09-09')).toBe(false);
  });
});

describe('isJanuary', () => {
  it('is true only in January', () => {
    expect(isJanuary('2026-01-31')).toBe(true);
    expect(isJanuary('2026-02-01')).toBe(false);
  });
});

describe('parseYearParam', () => {
  it('accepts a 4-digit year and rejects partial or junk values', () => {
    expect(parseYearParam('2026')).toBe(2026);
    expect(parseYearParam(undefined)).toBeUndefined();
    expect(parseYearParam('nope')).toBeUndefined();
    expect(parseYearParam('2026abc')).toBeUndefined();
    expect(parseYearParam('26')).toBeUndefined();
  });
});

describe('resolveStatisticsYear', () => {
  it('defaults to the previous calendar year', () => {
    expect(resolveStatisticsYear(undefined, [2024, 2025, 2026], '2026-09-09')).toBe(2025);
  });

  it('accepts the current year and known past years', () => {
    expect(resolveStatisticsYear('2026', [2025, 2026], '2026-09-09')).toBe(2026);
    expect(resolveStatisticsYear('2024', [2024], '2026-09-09')).toBe(2024);
  });

  it('rejects future, unknown, or malformed years', () => {
    expect(resolveStatisticsYear('2027', [2026], '2026-09-09')).toBe(2025);
    expect(resolveStatisticsYear('nope', [2026], '2026-09-09')).toBe(2025);
    expect(resolveStatisticsYear('2025abc', [2025], '2026-09-09')).toBe(2025);
  });
});
