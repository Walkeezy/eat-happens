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

export function previousCalendarYearRange(today = todayCalendarDate()): { year: number; start: string; end: string } {
  const year = calendarYear(today) - 1;

  return {
    year,
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}
