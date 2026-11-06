/// <reference lib="webworker" />
import { notificationUrl, parsePushPayload } from './sw-push';

// The app's service worker. Bundled by Next from the register() call in register-service-worker.ts. It only shows
// push messages (src/services/push.ts); nothing is cached.

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', () => {
  void sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener('push', (event) => {
  const { title, body, url } = parsePushPayload(event.data?.text());
  event.waitUntil(sw.registration.showNotification(title, { body, icon: '/icon-192x192.png', data: { url } }));
});

/** Opens the message's screen: in the app's open window if there is one. Only a window this worker controls can be
 * navigated, so others are left alone and a new one opens. */
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(notificationUrl(event.notification.data), sw.location.origin).href;
  event.waitUntil(
    (async () => {
      const [open] = await sw.clients.matchAll({ type: 'window' });
      if (!open) {
        await sw.clients.openWindow(target);
        return;
      }
      // A refused focus must not keep the screen from changing.
      await open.focus().catch(() => undefined);
      if (open.url !== target) {
        await open.navigate(target).catch(() => sw.clients.openWindow(target));
      }
    })(),
  );
});
