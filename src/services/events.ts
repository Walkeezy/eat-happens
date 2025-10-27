import { db } from '@/db';
import { event } from '@/db/schema';
import { shouldHideRatings } from '@/lib/ratings-visibility';
import type { CreateEventData, Event, EventWithDetails, UpdateEventData } from '@/types/events';
import { desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function getEvents(currentUserId?: string): Promise<EventWithDetails[]> {
  // Use Drizzle's optimized Queries API with relations
  const eventsWithDetails = await db.query.event.findMany({
    orderBy: [desc(event.date)],
    with: {
      ratings: {
        with: {
          user: true,
        },
      },
      assignments: {
        with: {
          user: true,
        },
      },
    },
  });

  const hideRatings = shouldHideRatings();

  // Transform to match the expected interface and calculate averages
  return eventsWithDetails.map((evt) => {
    const ratings = evt.ratings || [];
    const assignments = evt.assignments || [];

    const averageRating =
      hideRatings || ratings.length === 0 ? 0 : ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

    return {
      ...evt,
      ratings: ratings.map((r) => ({
        ...r,
        // Hide score for other users when ratings are hidden, but show current user's own rating
        score: hideRatings && r.userId !== currentUserId ? 0 : r.score,
        user: r.user ? { ...r.user, image: r.user.image } : undefined,
      })),
      assignments: assignments.map((a) => ({
        ...a,
        user: { ...a.user, image: a.user.image ?? undefined },
      })),
      assignedUsers: assignments
        .map((a) => ({
          ...a.user,
          image: a.user.image ?? undefined,
        }))
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
      averageRating,
      totalRatings: ratings.length,
    };
  });
}

export async function createEvent(data: CreateEventData): Promise<Event> {
  const eventId = nanoid();

  const [newEvent] = await db
    .insert(event)
    .values({
      id: eventId,
      restaurant: data.restaurant,
      date: data.date,
    })
    .returning();

  return newEvent;
}

export async function updateEvent(eventId: string, data: UpdateEventData): Promise<Event | null> {
  const [updatedEvent] = await db.update(event).set(data).where(eq(event.id, eventId)).returning();

  if (!updatedEvent) {
    return null;
  }

  return updatedEvent;
}
