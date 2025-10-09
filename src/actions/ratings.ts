'use server';

import { auth } from '@/lib/auth';
import { isUserAssignedToEvent } from '@/services/assignments';
import { upsertRating } from '@/services/ratings';
import { CreateRatingData } from '@/types/events';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createRatingSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  score: z.number().min(1, 'Score must be at least 1').max(5, 'Score must be at most 5'),
  comment: z.string().optional(),
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
    throw new Error('You can only rate events you are assigned to');
  }

  try {
    const rating = await upsertRating(session.user.id, validatedData);
    return { success: true, rating };
  } catch (error) {
    console.error('Error upserting rating:', error);
    throw new Error('Failed to save rating');
  }
}
