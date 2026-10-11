'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { type ActionResult, AppError, actionFailure } from '@/lib/action-result';
import { createRatingSchema } from '@/lib/schemas';
import { verifySession } from '@/lib/verify-session';
import { isUserAssignedToEvent } from '@/services/assignments';
import { saveRating } from '@/services/ratings';
import type { CreateRatingData } from '@/types/events';

export async function saveRatingAction(data: CreateRatingData): Promise<ActionResult> {
  const { session } = await verifySession();

  try {
    const validatedData = createRatingSchema.parse(data);

    const isAssigned = await isUserAssignedToEvent(session.user.id, validatedData.eventId);
    if (!isAssigned) {
      throw new AppError('Du kannst nur Events bewerten, denen du zugewiesen bist');
    }

    await saveRating(session.user.id, validatedData);
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return actionFailure(error, 'Bewertung konnte nicht gespeichert werden');
  }
}
