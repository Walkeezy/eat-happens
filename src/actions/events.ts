'use server';

import { auth } from '@/lib/auth';
import { assignMultipleUsers, updateEventAssignments } from '@/services/assignments';
import { createEvent, updateEvent } from '@/services/events';
import { CreateEventData, EventAssignment, UpdateEventData } from '@/types/events';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createEventWithAssignmentsSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant name is required'),
  date: z.date(),
  assignedUserIds: z.array(z.string()).optional(),
});

const updateEventSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant name is required').optional(),
  date: z.date().optional(),
});

export async function updateEventWithAssignmentsAction(
  eventId: string,
  data: UpdateEventData & { assignedUserIds?: string[] },
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
    throw new Error('Only admins can update events');
  }

  // Validate data
  const validatedData = updateEventSchema.parse(data);

  try {
    // Update the event first
    const event = await updateEvent(eventId, validatedData);
    if (!event) {
      throw new Error('Event not found');
    }

    // Handle assignment updates if provided
    let assignmentChanges = 0;
    if (data.assignedUserIds !== undefined) {
      assignmentChanges = await updateEventAssignments(session.user.id, eventId, data.assignedUserIds);
    }

    return {
      success: true,
      event,
      assignmentChanges,
    };
  } catch (error) {
    console.error('Error updating event with assignments:', error);
    throw new Error('Failed to update event');
  }
}

export async function createEventWithAssignmentsAction(data: CreateEventData & { assignedUserIds?: string[] }) {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (!session.user.isAdmin) {
    throw new Error('Only admins can create events');
  }

  // Validate data
  const validatedData = createEventWithAssignmentsSchema.parse(data);

  try {
    // Create the event first
    const event = await createEvent({
      restaurant: validatedData.restaurant,
      date: validatedData.date,
    });

    // Assign users if any were selected
    let assignments: EventAssignment[] = [];
    if (validatedData.assignedUserIds && validatedData.assignedUserIds.length > 0) {
      assignments = await assignMultipleUsers(session.user.id, event.id, validatedData.assignedUserIds);
    }

    return {
      success: true,
      event,
      assignments,
      assignedCount: assignments.length,
    };
  } catch (error) {
    console.error('Error creating event with assignments:', error);
    throw new Error('Failed to create event');
  }
}
