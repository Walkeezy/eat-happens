import 'server-only';
import { and, desc, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { event } from '@/db/schema';
import { calendarYear, calendarYearRange, isClosedCalendarYear, todayCalendarDate } from '@/lib/calendar-date';
import { buildRestaurantDetail, type RestaurantDetail } from '@/lib/restaurant-detail';
import { buildRestaurantRows } from '@/lib/restaurant-rows';
import type { RestaurantRow } from '@/lib/restaurants';
import { rankedOverall } from '@/lib/statistics';
import { displayName } from '@/lib/user';
import { getEvent } from '@/services/events';
import { userSummaryColumns } from '@/services/users';
import type { EventWithDetails } from '@/types/events';

const ratingScoreColumns = {
  legacyScore: true,
  foodScore: true,
  ambienceScore: true,
  pricePerformanceScore: true,
} as const;

/**
 * The restaurant list only needs scores, the guest count and the picker's name. It does not depend on who is
 * asking: the current year's scores are hidden for everyone, so the query can run before the session is checked.
 */
export async function getRestaurantRows(): Promise<RestaurantRow[]> {
  const events = await db.query.event.findMany({
    where: lte(event.date, todayCalendarDate()),
    orderBy: [desc(event.date)],
    columns: { id: true, date: true, restaurant: true, totalCost: true },
    with: {
      ratings: { columns: ratingScoreColumns },
      assignments: { columns: { userId: true } },
      pickedByUser: { columns: userSummaryColumns },
    },
  });

  return buildRestaurantRows(
    events.map((item) => ({
      id: item.id,
      date: item.date,
      restaurant: item.restaurant,
      totalCost: item.totalCost,
      pickerName: item.pickedByUser ? displayName(item.pickedByUser) : null,
      attendeeCount: item.assignments.length,
      ratings: item.ratings,
    })),
  );
}

type YearRank = { rank: number; total: number; year: number };

/**
 * Where the dinner landed in its year's group ranking - only once the year is closed and the ranking is public.
 * One query for that year's scores is enough; the detail page streams the row in instead of waiting for it.
 */
export async function getYearRank(eventId: string, date: string): Promise<YearRank | undefined> {
  const year = calendarYear(date);
  if (!isClosedCalendarYear(year)) {
    return undefined;
  }

  const { start, end } = calendarYearRange(year);
  const events = await db.query.event.findMany({
    where: and(gte(event.date, start), lte(event.date, end)),
    columns: { id: true, restaurant: true },
    with: { ratings: { columns: ratingScoreColumns } },
  });

  const ranking = rankedOverall(events);
  const index = ranking.findIndex((row) => row.id === eventId);

  return index === -1 ? undefined : { rank: index + 1, total: ranking.length, year };
}

export async function getRestaurantDetail(
  eventId: string,
  currentUserId: string | Promise<string>,
): Promise<{ event: EventWithDetails; detail: RestaurantDetail } | null> {
  const event = await getEvent(eventId, currentUserId);
  // The restaurant list only covers dinners that already took place, the detail page follows suit.
  if (!event || event.date > todayCalendarDate()) {
    return null;
  }

  return { event, detail: buildRestaurantDetail(event) };
}
