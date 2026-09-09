'use server';

import { revalidatePath } from 'next/cache';
import { type EventWithAssignmentsData, eventWithAssignmentsSchema } from '@/lib/schemas';
import { requireAdmin } from '@/lib/verify-session';
import { createEventWithAssignments, updateEventWithAssignments } from '@/services/events';

export async function updateEventWithAssignmentsAction(eventId: string, data: EventWithAssignmentsData) {
  const { user } = await requireAdmin();
  const validatedData = eventWithAssignmentsSchema.parse(data);

  try {
    const { event, assignmentChanges } = await updateEventWithAssignments(user.id, eventId, validatedData);

    revalidatePath('/', 'layout');

    return {
      success: true,
      event,
      assignmentChanges,
    };
  } catch (error) {
    console.error('Error updating event with assignments:', error);
    throw new Error('Event konnte nicht aktualisiert werden');
  }
}

export async function createEventWithAssignmentsAction(data: EventWithAssignmentsData) {
  const { user } = await requireAdmin();
  const validatedData = eventWithAssignmentsSchema.parse(data);

  try {
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
    throw new Error('Event konnte nicht erstellt werden');
  }
}
