import { desc, eq, lte, type SQL } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { type DbClient, db } from '@/db';
import { event } from '@/db/schema';
import { applyRatingsVisibility } from '@/lib/ratings-visibility';
import type { EventWithAssignmentsData } from '@/lib/schemas';
import { scoreAverage } from '@/lib/scores';
import { assertConfirmedUsers, assignMultipleUsers, updateEventAssignments } from '@/services/assignments';
import { userSummaryColumns } from '@/services/users';
import type { CreateEventData, Event, EventWithDetails, UpdateEventData } from '@/types/events';

type GetEventsOptions = {
  upToDate?: string;
  currentUserId?: string;
};

const eventDetailsRelations = {
  ratings: {
    with: {
      user: { columns: userSummaryColumns },
    },
  },
  assignments: {
    columns: { userId: true },
    with: {
      user: { columns: userSummaryColumns },
    },
  },
  pickedByUser: { columns: userSummaryColumns },
} as const;

type EventWithRelations = NonNullable<Awaited<ReturnType<typeof findEventWithRelations>>>;

function findEventWithRelations(eventId: string) {
  return db.query.event.findFirst({ where: eq(event.id, eventId), with: eventDetailsRelations });
}

function toEventWithDetails({ assignments = [], ...evt }: EventWithRelations, currentUserId?: string): EventWithDetails {
  const ratings = evt.ratings || [];

  const averageLegacyRating = scoreAverage(ratings, 'legacyScore');
  const averageFoodRating = scoreAverage(ratings, 'foodScore');
  const averageAmbienceRating = scoreAverage(ratings, 'ambienceScore');
  const averagePricePerformanceRating = scoreAverage(ratings, 'pricePerformanceScore');

  return applyRatingsVisibility(
    {
      ...evt,
      assignedUsers: assignments
        .map((a) => ({
          ...a.user,
          image: a.user.image ?? undefined,
        }))
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
      pickedByUser: evt.pickedByUser
        ? {
            id: evt.pickedByUser.id,
            name: evt.pickedByUser.name,
            firstName: evt.pickedByUser.firstName,
            lastName: evt.pickedByUser.lastName,
            email: evt.pickedByUser.email,
          }
        : null,
      averageLegacyRating,
      averageFoodRating,
      averageAmbienceRating,
      averagePricePerformanceRating,
      totalRatings: ratings.length,
    },
    currentUserId,
  );
}

export async function getEvents(options?: GetEventsOptions): Promise<EventWithDetails[]> {
  const where: SQL | undefined = options?.upToDate ? lte(event.date, options.upToDate) : undefined;
  const eventsWithDetails = await db.query.event.findMany({
    where,
    orderBy: [desc(event.date)],
    with: eventDetailsRelations,
  });

  return eventsWithDetails.map((evt) => toEventWithDetails(evt, options?.currentUserId));
}

export async function getEvent(eventId: string, currentUserId?: string): Promise<EventWithDetails | null> {
  const evt = await findEventWithRelations(eventId);

  return evt ? toEventWithDetails(evt, currentUserId) : null;
}

/** The picker dropdown only offers confirmed users; this keeps a hand-crafted payload from reaching the FK. */
async function assertConfirmedPicker(pickedByUserId: string | null | undefined, client: DbClient): Promise<void> {
  if (!pickedByUserId) {
    return;
  }

  await assertConfirmedUsers([pickedByUserId], client, 'Nur bestätigte Benutzer können ein Restaurant auswählen');
}

async function createEvent(data: CreateEventData, client: DbClient): Promise<Event> {
  const [newEvent] = await client
    .insert(event)
    .values({
      id: nanoid(),
      restaurant: data.restaurant,
      date: data.date,
      totalCost: data.totalCost,
      pickedByUserId: data.pickedByUserId,
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
      pickedByUserId: data.pickedByUserId,
    })
    .where(eq(event.id, eventId))
    .returning();

  return updatedEvent ?? null;
}

export async function createEventWithAssignments(assignedBy: string, data: EventWithAssignmentsData) {
  return db.transaction(async (tx) => {
    await assertConfirmedPicker(data.pickedByUserId, tx);
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
    await assertConfirmedPicker(data.pickedByUserId, tx);
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
