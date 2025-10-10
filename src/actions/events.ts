'use server';

import { auth } from '@/lib/auth';
import { assignMultipleUsers, updateEventAssignments } from '@/services/assignments';
import { createEvent, updateEvent } from '@/services/events';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createEventWithAssignmentsSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant-Name ist erforderlich'),
  date: z.date(),
  assignedUserIds: z.array(z.string()),
});

const updateEventWithAssignmentsSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant-Name ist erforderlich'),
  date: z.date(),
  assignedUserIds: z.array(z.string()),
});

export async function updateEventWithAssignmentsAction(
  eventId: string,
  data: { restaurant: string; date: Date; assignedUserIds: string[] },
) {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (!session.user.isAdmin) {
    throw new Error('Nur Administratoren können Events aktualisieren');
  }

  // Validate data
  const validatedData = updateEventWithAssignmentsSchema.parse(data);

  try {
    // Update the event first
    const event = await updateEvent(eventId, {
      restaurant: validatedData.restaurant,
      date: validatedData.date,
    });
    if (!event) {
      throw new Error('Event nicht gefunden');
    }

    // Update assignments
    const assignmentChanges = await updateEventAssignments(session.user.id, eventId, validatedData.assignedUserIds);

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

export async function createEventWithAssignmentsAction(data: { restaurant: string; date: Date; assignedUserIds: string[] }) {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (!session.user.isAdmin) {
    throw new Error('Nur Administratoren können Events erstellen');
  }

  // Validate data
  const validatedData = createEventWithAssignmentsSchema.parse(data);

  try {
    // Create the event first
    const event = await createEvent({
      restaurant: validatedData.restaurant,
      date: validatedData.date,
    });

    // Assign users
    const assignments = await assignMultipleUsers(session.user.id, event.id, validatedData.assignedUserIds);

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
