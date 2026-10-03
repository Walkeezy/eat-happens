import { calendarYear, isClosedCalendarYear, todayCalendarDate } from '@/lib/calendar-date';
import { buildRestaurantDetail, type RestaurantDetail } from '@/lib/restaurant-detail';
import { buildRestaurantRows, type RestaurantRow } from '@/lib/restaurants';
import { displayName } from '@/lib/user';
import { getEvent, getEvents } from '@/services/events';
import { getYearStatistics } from '@/services/statistics';
import type { EventWithDetails } from '@/types/events';

export async function getRestaurantRows(currentUserId: string): Promise<RestaurantRow[]> {
  const events = await getEvents({ upToDate: todayCalendarDate(), currentUserId });

  return buildRestaurantRows(
    events.map((event) => ({
      id: event.id,
      date: event.date,
      restaurant: event.restaurant,
      totalCost: event.totalCost,
      pickerName: event.pickedByUser ? displayName(event.pickedByUser) : null,
      attendeeCount: event.assignedUsers?.length ?? 0,
      ratings: event.ratings ?? [],
    })),
  );
}

type YearRank = { rank: number; total: number; year: number };

/**
 * Where the dinner landed in its year's group ranking - only once the year is closed and the ranking is public.
 * It needs the whole year's statistics, so the detail page streams it in instead of waiting for it.
 */
export async function getYearRank(event: EventWithDetails, currentUserId: string): Promise<YearRank | undefined> {
  const year = calendarYear(event.date);
  if (!isClosedCalendarYear(year)) {
    return undefined;
  }

  const ranking = (await getYearStatistics(year, currentUserId)).overallRanking ?? [];
  const index = ranking.findIndex((row) => row.id === event.id);

  return index === -1 ? undefined : { rank: index + 1, total: ranking.length, year };
}

export async function getRestaurantDetail(
  eventId: string,
  currentUserId: string,
): Promise<{ event: EventWithDetails; detail: RestaurantDetail } | null> {
  const event = await getEvent(eventId, currentUserId);
  // The restaurant list only covers dinners that already took place, the detail page follows suit.
  if (!event || event.date > todayCalendarDate()) {
    return null;
  }

  return { event, detail: buildRestaurantDetail(event) };
}
