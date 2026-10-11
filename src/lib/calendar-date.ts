/**
 * Calendar dates are plain `YYYY-MM-DD` strings, the same as the `date` column in Postgres. Everything here is
 * string arithmetic plus `Intl`, so it is safe in the browser bundle and does not need a date library.
 */

/** The group dines in Switzerland; "today" follows that clock, not the server's (UTC on Vercel). */
const APP_TIME_ZONE = 'Europe/Zurich';

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const calendarDateParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const displayFormat = new Intl.DateTimeFormat('de-CH', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** The calendar date of a moment in time, as seen from the app's time zone. */
export function calendarDateOf(date: Date): string {
  const parts = Object.fromEntries(calendarDateParts.formatToParts(date).map((part) => [part.type, part.value]));

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function todayCalendarDate(): string {
  return calendarDateOf(new Date());
}

export function isValidCalendarDate(value: string): boolean {
  if (!CALENDAR_DATE_PATTERN.test(value)) {
    return false;
  }

  // Round-tripping through UTC catches days that do not exist, like 2026-02-31.
  const parsed = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function calendarYear(value: string): number {
  return Number(value.slice(0, 4));
}

/** `1. Januar 2026` - formatted in UTC so the calendar day never shifts with a time zone. */
export function displayCalendarDate(value: string): string {
  return displayFormat.format(new Date(`${value}T00:00:00Z`));
}

export function calendarYearRange(year: number): { year: number; start: string; end: string } {
  return {
    year,
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

export function previousCalendarYearRange(today = todayCalendarDate()): { year: number; start: string; end: string } {
  return calendarYearRange(calendarYear(today) - 1);
}

export function isClosedCalendarYear(year: number, today = todayCalendarDate()): boolean {
  return year < calendarYear(today);
}

export function parseYearParam(yearParam: string | undefined): number | undefined {
  if (yearParam === undefined || !/^\d{4}$/.test(yearParam)) {
    return undefined;
  }

  return Number(yearParam);
}

export function resolveStatisticsYear(yearParam: string | undefined, years: number[], today = todayCalendarDate()): number {
  const currentYear = calendarYear(today);
  const previousYear = currentYear - 1;
  const parsed = parseYearParam(yearParam);
  const allowed = new Set([...years, currentYear, previousYear]);

  if (parsed !== undefined && parsed <= currentYear && allowed.has(parsed)) {
    return parsed;
  }

  return currentYear;
}

/** Groups items by the calendar year of their date, newest year first. Keeps the input order within a year. */
export function groupByCalendarYear<T extends { date: string }>(items: T[]): { year: number; items: T[] }[] {
  const groups = new Map<number, T[]>();

  for (const item of items) {
    const year = calendarYear(item.date);
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }

  return [...groups.entries()].sort(([a], [b]) => b - a).map(([year, yearItems]) => ({ year, items: yearItems }));
}
