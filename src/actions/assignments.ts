'use server';

import { auth } from '@/lib/auth';
import { getAllConfirmedUsers, getCurrentAssignments, isUserAssignedToEvent } from '@/services/assignments';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkUserAssignmentAction(eventId: string) {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  try {
    const isAssigned = await isUserAssignedToEvent(session.user.id, eventId);

    return { success: true, isAssigned };
  } catch (error) {
    console.error('Error checking user assignment:', error);

    return { success: false, isAssigned: false };
  }
}

export async function getAllConfirmedUsersAction() {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (!session.user.isAdmin) {
    throw new Error('Only admins can view all users');
  }

  try {
    const users = await getAllConfirmedUsers();

    return { success: true, users };
  } catch (error) {
    console.error('Error fetching confirmed users:', error);
    throw new Error('Failed to fetch confirmed users');
  }
}

export async function getCurrentAssignmentsAction(eventId: string) {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (!session.user.isAdmin) {
    throw new Error('Only admins can view assignments');
  }

  try {
    const assignedUserIds = await getCurrentAssignments(eventId);

    return { success: true, assignedUserIds };
  } catch (error) {
    console.error('Error fetching current assignments:', error);
    throw new Error('Failed to fetch current assignments');
  }
}
