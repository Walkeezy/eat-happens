'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { type ActionResult, actionFailure } from '@/lib/action-result';
import { type EventWithAssignmentsData, eventWithAssignmentsSchema } from '@/lib/schemas';
import { requireAdmin } from '@/lib/verify-session';
import { createEventWithAssignments, updateEventWithAssignments } from '@/services/events';

export async function updateEventWithAssignmentsAction(
  eventId: string,
  data: EventWithAssignmentsData,
): Promise<ActionResult> {
  const { user } = await requireAdmin();

  try {
    const validatedData = eventWithAssignmentsSchema.parse(data);
    await updateEventWithAssignments(user.id, eventId, validatedData);
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return actionFailure(error, 'Event konnte nicht aktualisiert werden');
  }
}

export async function createEventWithAssignmentsAction(data: EventWithAssignmentsData): Promise<ActionResult> {
  const { user } = await requireAdmin();

  try {
    const validatedData = eventWithAssignmentsSchema.parse(data);
    await createEventWithAssignments(user.id, validatedData);
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return actionFailure(error, 'Event konnte nicht erstellt werden');
  }
}
