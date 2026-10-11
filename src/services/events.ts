import 'server-only';
import { desc, eq, lte, type SQL } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { type DbClient, db } from '@/db';
import { event } from '@/db/schema';
import { AppError } from '@/lib/action-result';
import { applyRatingsVisibility } from '@/lib/ratings-visibility';
import type { EventWithAssignmentsData } from '@/lib/schemas';
import { scoreAverage } from '@/lib/scores';
import { assertConfirmedUsers, assignMultipleUsers, updateEventAssignments } from '@/services/assignments';
import { userSummaryColumns } from '@/services/users';
import type { CreateEventData, Event, EventRating, EventWithDetails, UpdateEventData } from '@/types/events';

const ratingScoreColumns = {
  userId: true,
  legacyScore: true,
  foodScore: true,
  ambienceScore: true,
  pricePerformanceScore: true,
} as const;

const assignmentsWithUser = {
  columns: { userId: true },
  with: { user: { columns: userSummaryColumns } },
} as const;

/**
 * How much of each dinner a page loads. Only the detail page shows raters who are not on the guest list, so only
 * it loads the rater with every rating; the admin table shows no ratings at all.
 */
const eventShapes = {
  detail: {
    ratings: { columns: ratingScoreColumns, with: { user: { columns: userSummaryColumns } } },
    assignments: assignmentsWithUser,
    pickedByUser: { columns: userSummaryColumns },
  },
  cards: {
    ratings: { columns: ratingScoreColumns },
    assignments: assignmentsWithUser,
    pickedByUser: { columns: userSummaryColumns },
  },
  admin: {
    assignments: assignmentsWithUser,
    pickedByUser: { columns: userSummaryColumns },
  },
} as const;

type EventShape = keyof typeof eventShapes;

type EventRow = Event & {
  ratings?: EventRating[];
  assignments: { userId: string; user: NonNullable<EventWithDetails['assignedUsers']>[number] }[];
  pickedByUser: EventWithDetails['pickedByUser'];
};

type GetEventsOptions = {
  upToDate?: string;
  shape: EventShape;
  /**
   * Whose ratings stay visible in the current year. A promise is fine: the query starts right away and only the
   * post-processing waits for it, so a page can run the query while its session is still being verified.
   */
  currentUserId?: string | Promise<string>;
};

function toEventWithDetails({ assignments, ...evt }: EventRow, currentUserId?: string): EventWithDetails {
  const ratings = evt.ratings ?? [];

  return applyRatingsVisibility(
    {
      ...evt,
      assignedUsers: assignments
        .map((a) => ({ ...a.user, image: a.user.image ?? undefined }))
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
      averageLegacyRating: scoreAverage(ratings, 'legacyScore'),
      averageFoodRating: scoreAverage(ratings, 'foodScore'),
      averageAmbienceRating: scoreAverage(ratings, 'ambienceScore'),
      averagePricePerformanceRating: scoreAverage(ratings, 'pricePerformanceScore'),
      totalRatings: ratings.length,
    },
    currentUserId,
  );
}

export async function getEvents({ upToDate, shape, currentUserId }: GetEventsOptions): Promise<EventWithDetails[]> {
  const where: SQL | undefined = upToDate ? lte(event.date, upToDate) : undefined;
  const [rows, userId] = await Promise.all([
    db.query.event.findMany({ where, orderBy: [desc(event.date)], with: eventShapes[shape] }),
    currentUserId,
  ]);

  return (rows as EventRow[]).map((row) => toEventWithDetails(row, userId));
}

export async function getEvent(eventId: string, currentUserId?: string | Promise<string>): Promise<EventWithDetails | null> {
  const [row, userId] = await Promise.all([
    db.query.event.findFirst({ where: eq(event.id, eventId), with: eventShapes.detail }),
    currentUserId,
  ]);

  return row ? toEventWithDetails(row as EventRow, userId) : null;
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
      throw new AppError('Event nicht gefunden');
    }

    const assignmentChanges = await updateEventAssignments(assignedBy, eventId, data.assignedUserIds, tx);

    return {
      event: updated,
      assignmentChanges,
    };
  });
}
