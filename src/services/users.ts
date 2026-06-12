import { db } from '@/db';
import { user } from '@/db/schema';
import type { User } from '@/types/events';
import { asc, eq } from 'drizzle-orm';

export async function getAllUsers(): Promise<User[]> {
  return db.query.user.findMany({
    orderBy: [asc(user.createdAt)],
  });
}

export async function setUserConfirmed(userId: string, isConfirmed: boolean): Promise<User | undefined> {
  const [updated] = await db.update(user).set({ isConfirmed }).where(eq(user.id, userId)).returning();

  return updated;
}
