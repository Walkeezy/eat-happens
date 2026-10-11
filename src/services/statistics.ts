import { and, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/db';
import { event } from '@/db/schema';
import {
  calendarDateOf,
  calendarYear,
  calendarYearRange,
  isClosedCalendarYear,
  previousCalendarYearRange,
  todayCalendarDate,
} from '@/lib/calendar-date';
import { applyRatingsVisibility } from '@/lib/ratings-visibility';
import { buildYearStatistics, type YearStatistics } from '@/lib/statistics';
import { displayName } from '@/lib/user';
import { getAllConfirmedUsers } from '@/services/assignments';
import { userSummaryColumns } from '@/services/users';

export async function getEventYears(): Promise<number[]> {
  const today = todayCalendarDate();
  const rows = await db.selectDistinct({ year: sql<number>`extract(year from ${event.date})::int` }).from(event);
  const years = new Set(rows.map((row) => row.year));
  years.add(calendarYear(today));
  years.add(previousCalendarYearRange(today).year);

  return [...years].sort((a, b) => b - a);
}

/** `currentUserId` may be a promise, so the queries can start while the page is still verifying the session. */
export async function getYearStatistics(
  year: number,
  currentUserIdInput: string | Promise<string>,
): Promise<YearStatistics> {
  const today = todayCalendarDate();
  const isClosed = isClosedCalendarYear(year, today);
  const { start, end } = calendarYearRange(year);
  const until = end < today ? end : today;

  const [events, confirmedUsers, currentUserId] = await Promise.all([
    db.query.event.findMany({
      where: and(gte(event.date, start), lte(event.date, until)),
      with: {
        ratings: {
          with: {
            user: { columns: userSummaryColumns },
          },
        },
        assignments: { columns: { userId: true } },
        pickedByUser: { columns: userSummaryColumns },
      },
    }),
    getAllConfirmedUsers(),
    currentUserIdInput,
  ]);

  return buildYearStatistics({
    isClosed,
    currentUserId,
    events: events.map((item) =>
      applyRatingsVisibility(
        {
          id: item.id,
          date: item.date,
          restaurant: item.restaurant,
          totalCost: item.totalCost,
          pickedByUserId: item.pickedByUserId,
          pickerName: item.pickedByUser ? displayName(item.pickedByUser) : null,
          assignedUserIds: item.assignments.map((assignment) => assignment.userId),
          ratings: item.ratings.map((rating) => ({
            userId: rating.userId,
            raterName: rating.user ? displayName(rating.user) : null,
            legacyScore: rating.legacyScore,
            foodScore: rating.foodScore,
            ambienceScore: rating.ambienceScore,
            pricePerformanceScore: rating.pricePerformanceScore,
          })),
        },
        currentUserId,
      ),
    ),
    people: confirmedUsers.map((user) => ({
      id: user.id,
      name: displayName(user),
      createdOn: calendarDateOf(user.createdAt),
    })),
  });
}
