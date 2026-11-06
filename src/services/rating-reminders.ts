import 'server-only';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { event, eventAssignment, rating } from '@/db/schema';

export type MissingRating = { userId: string; eventId: string; restaurant: string };

/** Everyone on the guest list of a dinner on one of these dates who has not rated it yet. */
export async function getMissingRatings(dates: string[]): Promise<MissingRating[]> {
  return db
    .select({ userId: eventAssignment.userId, eventId: event.id, restaurant: event.restaurant })
    .from(eventAssignment)
    .innerJoin(event, eq(event.id, eventAssignment.eventId))
    .leftJoin(rating, and(eq(rating.eventId, eventAssignment.eventId), eq(rating.userId, eventAssignment.userId)))
    .where(and(inArray(event.date, dates), isNull(rating.id)));
}
