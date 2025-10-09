import { db } from '@/db';
import { event, rating } from '@/db/schema';
import { CreateEventData, Event, UpdateEventData } from '@/types/events';
import { desc, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function getEvents(): Promise<Event[]> {
  const events = await db
    .select({
      id: event.id,
      date: event.date,
      restaurant: event.restaurant,
      createdAt: event.createdAt,
      averageRating: sql<number>`AVG(${rating.score})`,
      totalRatings: sql<number>`COUNT(${rating.id})`,
    })
    .from(event)
    .leftJoin(rating, eq(event.id, rating.eventId))
    .groupBy(event.id, event.date, event.restaurant, event.createdAt)
    .orderBy(desc(event.date));

  return events.map((e) => ({
    ...e,
    averageRating: e.averageRating ? Number(e.averageRating) : 0,
    totalRatings: e.totalRatings ? Number(e.totalRatings) : 0,
  }));
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

  return {
    ...newEvent,
    averageRating: 0,
    totalRatings: 0,
  };
}

export async function updateEvent(eventId: string, data: UpdateEventData): Promise<Event | null> {
  const [updatedEvent] = await db.update(event).set(data).where(eq(event.id, eventId)).returning();

  if (!updatedEvent) {
    return null;
  }

  return {
    ...updatedEvent,
    averageRating: 0,
    totalRatings: 0,
  };
}
