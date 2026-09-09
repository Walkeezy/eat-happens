import { and, eq, type InferSelectModel, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { type DbClient, db } from '@/db';
import { eventAssignment, user } from '@/db/schema';

type EventAssignment = InferSelectModel<typeof eventAssignment>;
type User = InferSelectModel<typeof user>;

export async function isUserAssignedToEvent(userId: string, eventId: string): Promise<boolean> {
  const [assignment] = await db
    .select()
    .from(eventAssignment)
    .where(and(eq(eventAssignment.userId, userId), eq(eventAssignment.eventId, eventId)))
    .limit(1);

  return assignment !== undefined;
}

async function assertConfirmedUsers(userIds: string[], client: DbClient): Promise<void> {
  const uniqueIds = [...new Set(userIds)];
  const confirmed = await client
    .select({ id: user.id })
    .from(user)
    .where(and(inArray(user.id, uniqueIds), eq(user.isConfirmed, true)));

  if (confirmed.length !== uniqueIds.length) {
    throw new Error('Nur bestätigte Benutzer können zugewiesen werden');
  }
}

export async function assignMultipleUsers(
  assignedBy: string,
  eventId: string,
  userIds: string[],
  client: DbClient = db,
): Promise<EventAssignment[]> {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) {
    throw new Error('Mindestens ein Benutzer muss zugewiesen werden');
  }

  await assertConfirmedUsers(uniqueIds, client);

  const assignments = uniqueIds.map((userId) => ({
    id: nanoid(),
    userId,
    eventId,
    assignedBy,
  }));

  return client.insert(eventAssignment).values(assignments).returning();
}

export async function getAllConfirmedUsers(): Promise<User[]> {
  return db.query.user.findMany({
    where: eq(user.isConfirmed, true),
  });
}

async function getCurrentAssignments(eventId: string, client: DbClient): Promise<string[]> {
  const assignments = await client
    .select({ userId: eventAssignment.userId })
    .from(eventAssignment)
    .where(eq(eventAssignment.eventId, eventId));

  return assignments.map((a) => a.userId);
}

export async function updateEventAssignments(
  assignedBy: string,
  eventId: string,
  newUserIds: string[],
  client: DbClient = db,
): Promise<number> {
  const uniqueIds = [...new Set(newUserIds)];
  if (uniqueIds.length === 0) {
    throw new Error('Mindestens ein Benutzer muss zugewiesen werden');
  }

  await assertConfirmedUsers(uniqueIds, client);

  const currentUserIds = await getCurrentAssignments(eventId, client);

  const usersToAdd = uniqueIds.filter((id) => !currentUserIds.includes(id));
  const usersToRemove = currentUserIds.filter((id) => !uniqueIds.includes(id));

  let totalChanges = 0;

  if (usersToRemove.length > 0) {
    await client
      .delete(eventAssignment)
      .where(and(eq(eventAssignment.eventId, eventId), inArray(eventAssignment.userId, usersToRemove)));
    totalChanges += usersToRemove.length;
  }

  if (usersToAdd.length > 0) {
    await assignMultipleUsers(assignedBy, eventId, usersToAdd, client);
    totalChanges += usersToAdd.length;
  }

  return totalChanges;
}
