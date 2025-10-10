import { db } from '@/db';
import { rating } from '@/db/schema';
import { and, eq, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Types specific to this service
type Rating = InferSelectModel<typeof rating>;
type CreateRatingData = Pick<InferInsertModel<typeof rating>, 'eventId' | 'score'>;

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
      })
      .where(and(eq(rating.userId, userId), eq(rating.eventId, data.eventId)))
      .returning();

    return updatedRating;
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
    })
    .returning();

  return newRating;
}
