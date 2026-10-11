'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { z } from 'zod';
import { type ActionResult, AppError, actionFailure } from '@/lib/action-result';
import { requireAdmin } from '@/lib/verify-session';
import { setUserConfirmed } from '@/services/users';

const setUserConfirmedSchema = z.object({
  userId: z.string().min(1),
  isConfirmed: z.boolean(),
});

export async function setUserConfirmedAction(data: { userId: string; isConfirmed: boolean }): Promise<ActionResult> {
  const { user: admin } = await requireAdmin();

  try {
    const { userId, isConfirmed } = setUserConfirmedSchema.parse(data);

    if (admin.id === userId) {
      throw new AppError('Du kannst deine eigene Bestätigung nicht ändern');
    }

    const updated = await setUserConfirmed(userId, isConfirmed);
    if (!updated) {
      throw new AppError('Benutzer nicht gefunden');
    }

    revalidatePath('/users');

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return actionFailure(error, 'Benutzer konnte nicht aktualisiert werden');
  }
}
