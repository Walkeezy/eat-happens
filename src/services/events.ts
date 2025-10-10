import { db } from '@/db';
import { event, eventAssignment, rating } from '@/db/schema';
import { desc, eq, InferInsertModel, InferSelectModel } from 'drizzle-orm';
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
      firstName: string | null;
      lastName: string | null;
      email: string;
      image?: string | null;
    };
  })[];
  averageRating?: number;
  totalRatings?: number;
  assignments?: InferSelectModel<typeof eventAssignment>[];
  assignedUsers?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image?: string | null;
    isAdmin: boolean;
    isConfirmed: boolean;
  }[];
}

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

  // Transform to match the expected interface and calculate averages
  return eventsWithDetails.map((evt) => {
    const ratings = evt.ratings || [];
    const assignments = evt.assignments || [];

    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length : 0;

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
      assignedUsers: assignments.map((a) => ({
        ...a.user,
        image: a.user.image ?? undefined,
      })),
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
