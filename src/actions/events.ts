'use server';

import { requireAdmin } from '@/lib/verify-session';
import { assignMultipleUsers, updateEventAssignments } from '@/services/assignments';
import { createEvent, updateEvent } from '@/services/events';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const eventWithAssignmentsSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant-Name ist erforderlich'),
  date: z.date(),
  assignedUserIds: z.array(z.string()).min(1, 'Mindestens ein Benutzer muss zugewiesen werden'),
  totalCost: z.number().positive().optional(),
});

export async function updateEventWithAssignmentsAction(
  eventId: string,
  data: { restaurant: string; date: Date; assignedUserIds: string[]; totalCost?: number },
) {
  const { user } = await requireAdmin();
  const validatedData = eventWithAssignmentsSchema.parse(data);

  try {
    const event = await updateEvent(eventId, {
      restaurant: validatedData.restaurant,
      date: validatedData.date,
      totalCost: validatedData.totalCost,
    });
    if (!event) {
      throw new Error('Event nicht gefunden');
    }

    const assignmentChanges = await updateEventAssignments(user.id, eventId, validatedData.assignedUserIds);

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

export async function createEventWithAssignmentsAction(data: {
  restaurant: string;
  date: Date;
  assignedUserIds: string[];
  totalCost?: number;
}) {
  const { user } = await requireAdmin();
  const validatedData = eventWithAssignmentsSchema.parse(data);

  try {
    const event = await createEvent({
      restaurant: validatedData.restaurant,
      date: validatedData.date,
      totalCost: validatedData.totalCost,
    });

    const assignments = await assignMultipleUsers(user.id, event.id, validatedData.assignedUserIds);

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
