import { nanoid } from 'nanoid';
import { db } from '@/db';
import { rating } from '@/db/schema';

export async function saveRating(
  userId: string,
  data: { eventId: string; foodScore: number; ambienceScore: number; pricePerformanceScore: number },
) {
  // One round trip: the unique (user, event) index rejects a second rating, also when two submits race each other.
  const [newRating] = await db
    .insert(rating)
    .values({
      id: nanoid(),
      userId,
      eventId: data.eventId,
      foodScore: data.foodScore,
      ambienceScore: data.ambienceScore,
      pricePerformanceScore: data.pricePerformanceScore,
    })
    .onConflictDoNothing({ target: [rating.userId, rating.eventId] })
    .returning();

  if (!newRating) {
    throw new Error('Du hast dieses Event bereits bewertet und kannst deine Bewertung nicht mehr ändern');
  }

  return newRating;
}
