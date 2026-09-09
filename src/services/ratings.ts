import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { rating } from '@/db/schema';

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
