import { timingSafeEqual } from 'node:crypto';
import { restaurantHref } from '@/components/restaurant-link';
import { addCalendarDays, todayCalendarDate } from '@/lib/calendar-date';
import { pushConfigured, sendPush } from '@/services/push';
import { getMissingRatings } from '@/services/rating-reminders';

export const dynamic = 'force-dynamic';

/** Reminders are sent this many days after the dinner. The cron runs once a day, so each day is hit exactly once. */
const REMINDER_DAYS = [3, 7];

function bearerMatches(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? '');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Called daily by Vercel Cron (vercel.json) with `Authorization: Bearer CRON_SECRET`. Reminds everyone on the guest
 * list of a dinner 3 or 7 days ago who has not rated it yet. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!pushConfigured() || !secret) {
    return new Response('Not found', { status: 404 });
  }
  if (!bearerMatches(request.headers.get('authorization'), secret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = todayCalendarDate();
  const missing = await getMissingRatings(REMINDER_DAYS.map((days) => addCalendarDays(today, -days)));

  const results = await Promise.all(
    missing.map(({ userId, eventId, restaurant }) =>
      sendPush(
        {
          title: `Wie war's im ${restaurant}?`,
          body: 'Du hast das Dinner noch nicht bewertet.',
          url: restaurantHref(eventId),
        },
        userId,
      ),
    ),
  );
  const total = results.reduce(
    (sum, result) => ({
      sent: sum.sent + result.sent,
      removed: sum.removed + result.removed,
      failed: sum.failed + result.failed,
    }),
    { sent: 0, removed: 0, failed: 0 },
  );

  return Response.json(total);
}
