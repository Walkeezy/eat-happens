'use server';

import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { unstable_rethrow } from 'next/navigation';
import { db } from '@/db';
import { pushSubscription } from '@/db/schema';
import { type ActionResult, AppError, actionFailure } from '@/lib/action-result';
import { endpointSchema, subscriptionSchema } from '@/lib/push-subscription';
import { verifySession } from '@/lib/verify-session';
import { pushConfigured } from '@/services/push';

const SUBSCRIBE_FAILED = 'Mitteilungen konnten nicht eingeschaltet werden';
const UNSUBSCRIBE_FAILED = 'Mitteilungen konnten nicht ausgeschaltet werden';

/** Stores this app's subscription for the signed-in person. Called again on every visit with one already there, so
 * a lost row comes back. */
export async function subscribePushAction(subscription: unknown): Promise<ActionResult> {
  const { user } = await verifySession();

  try {
    if (!pushConfigured()) {
      throw new AppError('Mitteilungen sind auf diesem Server nicht eingerichtet');
    }
    const parsed = subscriptionSchema.safeParse(subscription);
    if (!parsed.success) {
      throw new AppError(SUBSCRIBE_FAILED);
    }
    const { endpoint, keys } = parsed.data;
    const values = { userId: user.id, p256dh: keys.p256dh, auth: keys.auth };
    await db
      .insert(pushSubscription)
      .values({ id: nanoid(), endpoint, ...values })
      .onConflictDoUpdate({ target: pushSubscription.endpoint, set: values });

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return actionFailure(error, SUBSCRIBE_FAILED);
  }
}

/** Forgets this app's subscription; the browser drops its own side. */
export async function unsubscribePushAction(endpoint: string): Promise<ActionResult> {
  const { user } = await verifySession();

  try {
    const parsed = endpointSchema.safeParse(endpoint);
    if (!parsed.success) {
      throw new AppError(UNSUBSCRIBE_FAILED);
    }
    await db
      .delete(pushSubscription)
      .where(and(eq(pushSubscription.endpoint, parsed.data), eq(pushSubscription.userId, user.id)));

    return { success: true };
  } catch (error) {
    unstable_rethrow(error);
    return actionFailure(error, UNSUBSCRIBE_FAILED);
  }
}
