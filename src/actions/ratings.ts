'use server';

import { createRatingSchema } from '@/lib/schemas';
import { verifySession } from '@/lib/verify-session';
import { isUserAssignedToEvent } from '@/services/assignments';
import { saveRating } from '@/services/ratings';
import type { CreateRatingData } from '@/types/events';
import { revalidatePath } from 'next/cache';

export async function saveRatingAction(data: CreateRatingData) {
  const { session } = await verifySession();
  const validatedData = createRatingSchema.parse(data);

  const isAssigned = await isUserAssignedToEvent(session.user.id, validatedData.eventId);
  if (!isAssigned) {
    throw new Error('Du kannst nur Events bewerten, denen du zugewiesen bist');
  }

  try {
    const rating = await saveRating(session.user.id, validatedData);

    revalidatePath('/', 'layout');

    return { success: true, rating };
  } catch (error) {
    console.error('Error saving rating:', error);
    // Re-throw the error from the service layer to preserve the message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Bewertung konnte nicht gespeichert werden');
  }
}
