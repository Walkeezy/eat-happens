import { db } from '@/db';
import { event, eventAssignment, rating, user } from '@/db/schema';
import { desc, eq, InferInsertModel, InferSelectModel, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Types specific to this service
type Event = InferSelectModel<typeof event>;
type CreateEventData = Pick<InferInsertModel<typeof event>, 'restaurant' | 'date'>;
type UpdateEventData = Partial<CreateEventData>;

// Complex type for joined/computed data
interface EventWithDetails extends Event {
  ratings?: (InferSelectModel<typeof rating> & {
    user?: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  })[];
  averageRating?: number;
  totalRatings?: number;
  assignments?: InferSelectModel<typeof eventAssignment>[];
  assignedUsers?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    isAdmin: boolean;
    isConfirmed: boolean;
  }[];
}

export async function getEvents(): Promise<EventWithDetails[]> {
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

export async function getEventsWithRatingsAndAssignments(): Promise<EventWithDetails[]> {
  // Get all events
  const events = await db.select().from(event).orderBy(desc(event.date));

  // Get all ratings with user info for these events
  const allRatings = await db
    .select({
      id: rating.id,
      userId: rating.userId,
      eventId: rating.eventId,
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(rating)
    .innerJoin(user, eq(rating.userId, user.id));

  // Get all assignments with user info for these events
  const allAssignments = await db
    .select({
      id: eventAssignment.id,
      userId: eventAssignment.userId,
      eventId: eventAssignment.eventId,
      createdAt: eventAssignment.createdAt,
      assignedBy: eventAssignment.assignedBy,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        isConfirmed: user.isConfirmed,
      },
    })
    .from(eventAssignment)
    .innerJoin(user, eq(eventAssignment.userId, user.id));

  // Combine data
  return events.map((evt) => {
    const eventRatings = allRatings.filter((r) => r.eventId === evt.id);
    const eventAssignments = allAssignments.filter((a) => a.eventId === evt.id);

    const averageRating =
      eventRatings.length > 0 ? eventRatings.reduce((sum, r) => sum + r.score, 0) / eventRatings.length : 0;

    return {
      ...evt,
      ratings: eventRatings.map((r) => ({
        ...r,
        comment: r.comment,
        user: r.user
          ? {
              ...r.user,
              image: r.user.image,
            }
          : undefined,
      })),
      assignments: eventAssignments.map((a) => ({
        ...a,
        user: {
          ...a.user,
          image: a.user.image ?? undefined,
        },
      })),
      assignedUsers: eventAssignments.map((a) => ({
        ...a.user,
        image: a.user.image ?? undefined,
      })),
      averageRating,
      totalRatings: eventRatings.length,
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
