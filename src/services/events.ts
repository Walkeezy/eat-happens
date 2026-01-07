import { db } from '@/db';
import { event } from '@/db/schema';
import type { CreateEventData, Event, EventWithDetails, UpdateEventData } from '@/types/events';
import { desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function getEvents(): Promise<EventWithDetails[]> {
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

  // Helper to calculate average for a specific score field
  type RatingScores = {
    legacyScore: number | null;
    foodScore: number | null;
    ambienceScore: number | null;
    pricePerformanceScore: number | null;
  };
  const calculateAverage = (ratings: RatingScores[], field: keyof RatingScores) => {
    const validRatings = ratings.filter((r) => r[field] !== null && r[field] !== undefined);
    if (validRatings.length === 0) {
      return undefined;
    }

    return validRatings.reduce((sum, r) => sum + (r[field] ?? 0), 0) / validRatings.length;
  };

  // Transform to match the expected interface and calculate averages
  return eventsWithDetails.map((evt) => {
    const ratings = evt.ratings || [];
    const assignments = evt.assignments || [];

    const averageLegacyRating = calculateAverage(ratings, 'legacyScore');
    const averageFoodRating = calculateAverage(ratings, 'foodScore');
    const averageAmbienceRating = calculateAverage(ratings, 'ambienceScore');
    const averagePricePerformanceRating = calculateAverage(ratings, 'pricePerformanceScore');

    return {
      ...evt,
      ratings: ratings.map((r) => ({
        ...r,
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
      averageLegacyRating,
      averageFoodRating,
      averageAmbienceRating,
      averagePricePerformanceRating,
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
      totalCost: data.totalCost,
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
