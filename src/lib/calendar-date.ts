import { dayjs } from './dayjs';

const CALENDAR_DATE_FORMAT = 'YYYY-MM-DD';

function parseCalendarDate(value: string) {
  return dayjs(value, CALENDAR_DATE_FORMAT, true);
}

export function todayCalendarDate(): string {
  return dayjs().format(CALENDAR_DATE_FORMAT);
}

export function isValidCalendarDate(value: string): boolean {
  return parseCalendarDate(value).isValid();
}

export function calendarYear(value: string): number {
  return parseCalendarDate(value).year();
}

export function displayCalendarDate(value: string): string {
  return parseCalendarDate(value).format('D. MMMM YYYY');
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
