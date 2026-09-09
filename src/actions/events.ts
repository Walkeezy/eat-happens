'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type EventWithAssignmentsData, eventWithAssignmentsSchema } from '@/lib/schemas';
import { requireAdmin } from '@/lib/verify-session';
import { createEventWithAssignments, updateEventWithAssignments } from '@/services/events';

function rethrowEventActionError(error: unknown, fallback: string): never {
  if (error instanceof z.ZodError) {
    throw new Error(error.issues[0]?.message ?? fallback);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(fallback);
}

export async function updateEventWithAssignmentsAction(eventId: string, data: EventWithAssignmentsData) {
  const { user } = await requireAdmin();

  try {
    const validatedData = eventWithAssignmentsSchema.parse(data);
    const { event, assignmentChanges } = await updateEventWithAssignments(user.id, eventId, validatedData);

    revalidatePath('/', 'layout');

    return {
      success: true,
      event,
      assignmentChanges,
    };
  } catch (error) {
    console.error('Error updating event with assignments:', error);
    rethrowEventActionError(error, 'Event konnte nicht aktualisiert werden');
  }
}

export async function createEventWithAssignmentsAction(data: EventWithAssignmentsData) {
  const { user } = await requireAdmin();

  try {
    const validatedData = eventWithAssignmentsSchema.parse(data);
    const { event, assignments } = await createEventWithAssignments(user.id, validatedData);

    revalidatePath('/', 'layout');

    return {
      success: true,
      event,
      assignments,
      assignedCount: assignments.length,
    };
  } catch (error) {
    console.error('Error creating event with assignments:', error);
    rethrowEventActionError(error, 'Event konnte nicht erstellt werden');
  }
}
