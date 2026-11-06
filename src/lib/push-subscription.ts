import { z } from 'zod';

/** The push services of Safari, Chrome and the browsers built on it, Firefox and Edge. The server POSTs to
 * whatever endpoint is stored, so an address elsewhere (say, inside Vercel's network) is refused. */
const PUSH_SERVICE_DOMAINS = ['push.apple.com', 'fcm.googleapis.com', 'push.services.mozilla.com', 'notify.windows.com'];

function isPushService(endpoint: string): boolean {
  // Zod runs a refinement even after .url() failed.
  if (!URL.canParse(endpoint)) {
    return false;
  }
  const { protocol, hostname } = new URL(endpoint);
  return (
    protocol === 'https:' && PUSH_SERVICE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  );
}

/** PushSubscription.toJSON() from the browser. */
export const subscriptionSchema = z.object({
  endpoint: z.string().url().max(1000).refine(isPushService, 'must be a known push service'),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
});

export const endpointSchema = subscriptionSchema.shape.endpoint;
