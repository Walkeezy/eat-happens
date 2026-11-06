// The service worker's side of push messages, without zod or DOM types so it stays small in the worker bundle
// (src/lib/service-worker.ts).

export type PushMessage = {
  title: string;
  body: string;
  /** A path inside the app the notification opens. */
  url: string;
};

const FALLBACK: PushMessage = { title: 'Eat Happens', body: 'Neue Mitteilung', url: '/' };

const BASE = 'https://app.invalid';

/** A path inside the app, never another origin. Resolved the way the browser will, so "//evil.example",
 * "/\evil.example" and "/\t/evil.example" (the URL parser drops tabs and newlines) are all refused. */
function isAppPath(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return false;
  }
  try {
    return new URL(value, BASE).origin === BASE;
  } catch {
    return false;
  }
}

/** The push's text as the notification to show. Something is always shown: Safari drops the subscription of an
 * app that receives a push and shows nothing. */
export function parsePushPayload(text: string | null | undefined): PushMessage {
  try {
    const data: unknown = JSON.parse(text ?? '');
    if (typeof data !== 'object' || data === null) {
      return FALLBACK;
    }
    const { title, body, url } = data as Record<string, unknown>;
    return {
      title: typeof title === 'string' && title.trim() ? title : FALLBACK.title,
      body: typeof body === 'string' ? body : '',
      url: isAppPath(url) ? url : '/',
    };
  } catch {
    return FALLBACK;
  }
}

/** Where a tapped notification leads; its data is whatever showNotification got. */
export function notificationUrl(data: unknown): string {
  const url = typeof data === 'object' && data !== null ? (data as { url?: unknown }).url : null;
  return isAppPath(url) ? url : '/';
}
