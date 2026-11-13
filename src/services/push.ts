import 'server-only';
import { eq, inArray } from 'drizzle-orm';
import * as webpush from 'web-push';
import { db } from '@/db';
import { pushSubscription } from '@/db/schema';
import type { PushMessage } from '@/lib/sw-push';

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

/** Whether the VAPID keys are set; without them the app offers no push messages. */
export function pushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT);
}

/** What the browser needs to subscribe; null without push. */
export function vapidPublicKey(): string | null {
  return pushConfigured() ? (VAPID_PUBLIC_KEY ?? null) : null;
}

let vapidSet = false;

const SEND_TIMEOUT_MS = 10_000;

/** The push service no longer takes this subscription: 404/410 when the app is gone, 401/403 when it was made with
 * other VAPID keys. Such a row would fail on every send. */
const GONE_STATUSES = new Set([401, 403, 404, 410]);

export type PushResult = {
  sent: number;
  /** Subscriptions the push service no longer knows; deleted. */
  removed: number;
  failed: number;
};

/** Sends to every app the person subscribed. An app the push service reports gone (uninstalled, permission
 * withdrawn, subscribed with other VAPID keys) is deleted, so it isn't tried again. */
export async function sendPush(message: PushMessage, userId: string): Promise<PushResult> {
  if (!pushConfigured()) {
    throw new Error('push is not configured');
  }
  if (!vapidSet) {
    webpush.setVapidDetails(VAPID_SUBJECT ?? '', VAPID_PUBLIC_KEY ?? '', VAPID_PRIVATE_KEY ?? '');
    vapidSet = true;
  }
  const rows = await db.select().from(pushSubscription).where(eq(pushSubscription.userId, userId));

  const payload = JSON.stringify(message);
  const gone: string[] = [];
  let sent = 0;
  let failed = 0;
  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          payload,
          // A phone that is off for a while still gets the reminder. Without a timeout a hanging push service holds
          // up every send.
          { TTL: 12 * 3600, timeout: SEND_TIMEOUT_MS },
        );
        sent += 1;
      } catch (error) {
        const status = error instanceof webpush.WebPushError ? error.statusCode : null;
        if (status != null && GONE_STATUSES.has(status)) {
          gone.push(row.id);
        } else {
          failed += 1;
          console.error('push failed', { status, userId: row.userId });
        }
      }
    }),
  );
  if (gone.length > 0) {
    await db.delete(pushSubscription).where(inArray(pushSubscription.id, gone));
  }
  return { sent, removed: gone.length, failed };
}
