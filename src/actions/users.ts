'use server';

import { requireAdmin } from '@/lib/verify-session';
import { setUserConfirmed } from '@/services/users';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const setUserConfirmedSchema = z.object({
  userId: z.string().min(1),
  isConfirmed: z.boolean(),
});

export async function setUserConfirmedAction(data: { userId: string; isConfirmed: boolean }) {
  const { user: admin } = await requireAdmin();
  const { userId, isConfirmed } = setUserConfirmedSchema.parse(data);

  if (admin.id === userId) {
    throw new Error('Du kannst deine eigene Bestätigung nicht ändern');
  }

  const updated = await setUserConfirmed(userId, isConfirmed);
  if (!updated) {
    throw new Error('Benutzer nicht gefunden');
  }

  revalidatePath('/users');

  return { success: true };
}
