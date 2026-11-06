// Registers the service worker (src/lib/service-worker.ts). Next bundles the worker from the literal
// `register(new URL(...))` call below and serves it at a fixed URL, so the registration survives deploys and updates
// in place.

/** Production registers; development actively unregisters, so a worker left over from a production test never
 * interferes on localhost. */
export function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {});
    return;
  }
  const register = () => {
    navigator.serviceWorker
      .register(new URL('./service-worker.ts', import.meta.url), { scope: '/', updateViaCache: 'none' })
      .catch((error: unknown) => {
        console.error('service worker registration failed', error);
      });
  };
  // After the page has loaded, so the worker never competes with the screen's own assets.
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}
