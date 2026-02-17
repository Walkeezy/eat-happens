import { db } from '@/db';
import { event, eventAssignment, rating } from '@/db/schema';
import { dayjs } from '@/lib/dayjs';
import { and, avg, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export type Event2025Ranking = {
  id: string;
  restaurant: string;
  averageLegacyRating: number | null;
  totalRatings: number;
};

export async function saveRating(
  userId: string,
  data: { eventId: string; foodScore: number; ambienceScore: number; pricePerformanceScore: number },
) {
  const [existingRating] = await db
    .select()
    .from(rating)
    .where(and(eq(rating.userId, userId), eq(rating.eventId, data.eventId)))
    .limit(1);

  if (existingRating) {
    throw new Error('Du hast dieses Event bereits bewertet und kannst deine Bewertung nicht mehr ändern');
  }

  const ratingId = nanoid();
  const [newRating] = await db
    .insert(rating)
    .values({
      id: ratingId,
      userId,
      eventId: data.eventId,
      foodScore: data.foodScore,
      ambienceScore: data.ambienceScore,
      pricePerformanceScore: data.pricePerformanceScore,
    })
    .returning();

  return newRating;
}

export async function get2025Ratings(): Promise<Event2025Ranking[]> {
  const startOf2025 = dayjs('2025-01-01').startOf('day').toDate();
  const endOf2025 = dayjs('2025-12-31').endOf('day').toDate();

  const results = await db
    .select({
      id: event.id,
      restaurant: event.restaurant,
      averageLegacyRating: avg(rating.legacyScore),
      totalRatings: count(rating.id),
    })
    .from(event)
    .leftJoin(rating, eq(event.id, rating.eventId))
    .where(and(gte(event.date, startOf2025), lte(event.date, endOf2025)))
    .groupBy(event.id, event.restaurant)
    .orderBy(desc(avg(rating.legacyScore)), desc(count(rating.id)));

  return results.map((r) => ({
    ...r,
    averageLegacyRating: r.averageLegacyRating ? Number(r.averageLegacyRating) : null,
    totalRatings: Number(r.totalRatings),
  }));
}

export type EventCost = {
  id: string;
  restaurant: string;
  totalCost: number | null;
  attendeeCount: number;
  costPerPerson: number | null;
};

export async function getAllEventCosts(): Promise<EventCost[]> {
  const results = await db
    .select({
      id: event.id,
      restaurant: event.restaurant,
      totalCost: event.totalCost,
      attendeeCount: count(eventAssignment.id),
    })
    .from(event)
    .leftJoin(eventAssignment, eq(event.id, eventAssignment.eventId))
    .where(lte(event.date, dayjs().startOf('day').toDate()))
    .groupBy(event.id, event.restaurant, event.totalCost)
    .orderBy(
      sql`CASE WHEN ${event.totalCost} IS NULL THEN 1 ELSE 0 END`,
      desc(sql`${event.totalCost} / NULLIF(${count(eventAssignment.id)}, 0)`),
    );

  return results.map((r) => {
    const attendeeCount = Number(r.attendeeCount);

    return {
      id: r.id,
      restaurant: r.restaurant,
      totalCost: r.totalCost,
      attendeeCount,
      costPerPerson: r.totalCost && attendeeCount > 0 ? r.totalCost / attendeeCount : null,
    };
  });
}
