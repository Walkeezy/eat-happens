import { db } from '@/db';
import { rating } from '@/db/schema';
import { CreateRatingData, Rating } from '@/types/events';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function upsertRating(userId: string, data: CreateRatingData): Promise<Rating> {
  // Check if rating exists
  const [existingRating] = await db
    .select()
    .from(rating)
    .where(and(eq(rating.userId, userId), eq(rating.eventId, data.eventId)))
    .limit(1);

  if (existingRating) {
    // Update existing rating
    const [updatedRating] = await db
      .update(rating)
      .set({
        score: data.score,
        comment: data.comment,
      })
      .where(and(eq(rating.userId, userId), eq(rating.eventId, data.eventId)))
      .returning();

    return updatedRating as Rating;
  }

  // Create new rating
  const ratingId = nanoid();
  const [newRating] = await db
    .insert(rating)
    .values({
      id: ratingId,
      userId,
      eventId: data.eventId,
      score: data.score,
      comment: data.comment,
    })
    .returning();

  return newRating as Rating;
}
