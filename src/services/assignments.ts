import { db } from '@/db';
import { eventAssignment, user } from '@/db/schema';
import { EventAssignment, User } from '@/types/events';
import { and, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function isUserAssignedToEvent(userId: string, eventId: string): Promise<boolean> {
  const [assignment] = await db
    .select()
    .from(eventAssignment)
    .where(and(eq(eventAssignment.userId, userId), eq(eventAssignment.eventId, eventId)))
    .limit(1);

  return assignment !== undefined;
}

export async function assignMultipleUsers(
  assignedBy: string,
  eventId: string,
  userIds: string[],
): Promise<EventAssignment[]> {
  const assignments = userIds.map((userId) => ({
    id: nanoid(),
    userId,
    eventId,
    assignedBy,
  }));

  const newAssignments = await db.insert(eventAssignment).values(assignments).returning();

  return newAssignments as EventAssignment[];
}

export async function getAllConfirmedUsers(): Promise<User[]> {
  const confirmedUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isAdmin: user.isAdmin,
      isConfirmed: user.isConfirmed,
    })
    .from(user)
    .where(eq(user.isConfirmed, true));

  return confirmedUsers as User[];
}

export async function getCurrentAssignments(eventId: string): Promise<string[]> {
  const assignments = await db
    .select({ userId: eventAssignment.userId })
    .from(eventAssignment)
    .where(eq(eventAssignment.eventId, eventId));

  return assignments.map((a) => a.userId);
}

export async function updateEventAssignments(assignedBy: string, eventId: string, newUserIds: string[]): Promise<number> {
  // Get current assignments
  const currentUserIds = await getCurrentAssignments(eventId);

  // Determine which users to add and remove
  const usersToAdd = newUserIds.filter((id) => !currentUserIds.includes(id));
  const usersToRemove = currentUserIds.filter((id) => !newUserIds.includes(id));

  let totalChanges = 0;

  // Remove users no longer assigned
  if (usersToRemove.length > 0) {
    await db.delete(eventAssignment).where(
      and(
        eq(eventAssignment.eventId, eventId),
        // Use IN clause with array of user IDs to remove
        sql`${eventAssignment.userId} = ANY(${usersToRemove})`,
      ),
    );
    totalChanges += usersToRemove.length;
  }

  // Add new users
  if (usersToAdd.length > 0) {
    const newAssignments = usersToAdd.map((userId) => ({
      id: nanoid(),
      userId,
      eventId,
      assignedBy,
    }));

    await db.insert(eventAssignment).values(newAssignments);
    totalChanges += usersToAdd.length;
  }

  return totalChanges;
}
