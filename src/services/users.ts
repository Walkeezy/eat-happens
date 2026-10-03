import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { user } from '@/db/schema';
import type { User } from '@/types/events';

/** The user fields the UI shows next to events and ratings - leaves out timestamps, flags and auth details. */
export const userSummaryColumns = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  image: true,
} as const;

export async function getAllUsers(): Promise<User[]> {
  return db.query.user.findMany({
    orderBy: [asc(user.createdAt)],
  });
}

export async function setUserConfirmed(userId: string, isConfirmed: boolean): Promise<User | undefined> {
  const [updated] = await db.update(user).set({ isConfirmed }).where(eq(user.id, userId)).returning();

  return updated;
}
