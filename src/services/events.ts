import { desc, eq, lte, type SQL } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { type DbClient, db } from '@/db';
import { event } from '@/db/schema';
import type { EventWithAssignmentsData } from '@/lib/schemas';
import { assignMultipleUsers, updateEventAssignments } from '@/services/assignments';
import type { CreateEventData, Event, EventWithDetails, UpdateEventData } from '@/types/events';

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

type GetEventsOptions = {
  upToDate?: string;
};

export async function getEvents(options?: GetEventsOptions): Promise<EventWithDetails[]> {
  const where: SQL | undefined = options?.upToDate ? lte(event.date, options.upToDate) : undefined;
  const eventsWithDetails = await db.query.event.findMany({
    where,
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

  return eventsWithDetails.map((evt) => {
    const ratings = evt.ratings || [];
    const assignments = evt.assignments || [];

    const averageLegacyRating = calculateAverage(ratings, 'legacyScore');
    const averageFoodRating = calculateAverage(ratings, 'foodScore');
    const averageAmbienceRating = calculateAverage(ratings, 'ambienceScore');
    const averagePricePerformanceRating = calculateAverage(ratings, 'pricePerformanceScore');

    return {
      ...evt,
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

async function createEvent(data: CreateEventData, client: DbClient): Promise<Event> {
  const [newEvent] = await client
    .insert(event)
    .values({
      id: nanoid(),
      restaurant: data.restaurant,
      date: data.date,
      totalCost: data.totalCost,
    })
    .returning();

  return newEvent;
}

async function updateEvent(eventId: string, data: UpdateEventData, client: DbClient): Promise<Event | null> {
  const [updatedEvent] = await client
    .update(event)
    .set({
      restaurant: data.restaurant,
      date: data.date,
      totalCost: data.totalCost,
    })
    .where(eq(event.id, eventId))
    .returning();

  return updatedEvent ?? null;
}

export async function createEventWithAssignments(assignedBy: string, data: EventWithAssignmentsData) {
  return db.transaction(async (tx) => {
    const created = await createEvent(data, tx);
    const assignments = await assignMultipleUsers(assignedBy, created.id, data.assignedUserIds, tx);

    return {
      event: created,
      assignments,
    };
  });
}

export async function updateEventWithAssignments(assignedBy: string, eventId: string, data: EventWithAssignmentsData) {
  return db.transaction(async (tx) => {
    const updated = await updateEvent(eventId, data, tx);
    if (!updated) {
      throw new Error('Event nicht gefunden');
    }

    const assignmentChanges = await updateEventAssignments(assignedBy, eventId, data.assignedUserIds, tx);

    return {
      event: updated,
      assignmentChanges,
    };
  });
}
