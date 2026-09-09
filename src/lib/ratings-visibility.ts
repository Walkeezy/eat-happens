import { calendarYear, isValidCalendarDate, todayCalendarDate } from './calendar-date';

export function shouldHideRatings(eventDate: string): boolean {
  if (!isValidCalendarDate(eventDate)) {
    return false;
  }

  return calendarYear(eventDate) === calendarYear(todayCalendarDate());
}
