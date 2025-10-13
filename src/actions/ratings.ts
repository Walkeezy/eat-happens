'use server';

import { rating } from '@/db/schema';
import { auth } from '@/lib/auth';
import { isUserAssignedToEvent } from '@/services/assignments';
import { upsertRating } from '@/services/ratings';
import { InferInsertModel } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Inferred types
type CreateRatingData = Pick<InferInsertModel<typeof rating>, 'eventId' | 'score'>;

const createRatingSchema = z.object({
  eventId: z.string().min(1, 'Event-ID ist erforderlich'),
  score: z.number().min(1, 'Bewertung muss mindestens 1 sein').max(5, 'Bewertung darf höchstens 5 sein'),
});

export async function upsertRatingAction(data: CreateRatingData) {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Validate data
  const validatedData = createRatingSchema.parse(data);

  // Check if user is assigned to the event
  const isAssigned = await isUserAssignedToEvent(session.user.id, validatedData.eventId);
  if (!isAssigned) {
    throw new Error('Du kannst nur Events bewerten, denen du zugewiesen bist');
  }

  try {
    const rating = await upsertRating(session.user.id, validatedData);

    revalidatePath('/', 'layout');

    return { success: true, rating };
  } catch (error) {
    console.error('Error upserting rating:', error);
    throw new Error('Bewertung konnte nicht gespeichert werden');
  }
}
