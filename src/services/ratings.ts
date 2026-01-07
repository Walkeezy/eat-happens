import { db } from '@/db';
import { event, rating } from '@/db/schema';
import { dayjs } from '@/lib/dayjs';
import { and, avg, count, desc, eq, gte, lte } from 'drizzle-orm';
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
