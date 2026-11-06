'use client';

import { BellRing } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { subscribePushAction, unsubscribePushAction } from '@/actions/push';
import { Banner, BannerIcon } from '@/components/banner';
import { Button } from '@/components/shadcn/button';

type State = 'hidden' | 'install' | 'off';

const DISMISSED_KEY = 'push-banner-dismissed:v1';

/** The VAPID key as the bytes PushManager.subscribe wants. */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

/** Whether a subscription was made with this VAPID key. A browser that doesn't tell (null) gets the benefit of the
 * doubt. */
function sameKey(subscribed: ArrayBuffer | null, publicKey: string): boolean {
  if (!subscribed) {
    return true;
  }
  const expected = keyBytes(publicKey);
  const actual = new Uint8Array(subscribed);
  return actual.length === expected.length && actual.every((byte, i) => byte === expected[i]);
}

/** iOS without the home-screen app: Safari has no push there. */
function needsInstall(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches;
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
}

/** What this device can do with push messages right now. Keeps the server's row in step with an existing
 * subscription and drops one made with VAPID keys the server no longer has. */
async function detectState(publicKey: string): Promise<State> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return needsInstall() ? 'install' : 'hidden';
  }
  if (Notification.permission === 'denied') {
    return 'hidden';
  }

  // The service worker only runs in production builds, so in `next dev` there is no registration.
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return 'hidden';
  }

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return 'off';
  }
  if (!sameKey(subscription.options.applicationServerKey, publicKey)) {
    await unsubscribePushAction(subscription.endpoint).catch(() => undefined);
    await subscription.unsubscribe();
    return 'off';
  }

  subscribePushAction(subscription.toJSON()).catch((error) =>
    console.error('re-registering the push subscription failed', error),
  );
  return 'hidden';
}

/** Offers reminders for unrated dinners on this device, as long as they are off and the banner wasn't dismissed. */
export function PushBanner({ publicKey }: { publicKey: string }) {
  const [state, setState] = useState<State>('hidden');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    detectState(publicKey)
      .then((detected) => setState(detected !== 'hidden' && isDismissed() ? 'hidden' : detected))
      .catch(() => setState('hidden'));
  }, [publicKey]);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Private browsing: the banner just comes back next time.
    }
    setState('hidden');
  }

  function turnOn() {
    startTransition(async () => {
      // Loaded with the first toast, so sonner stays out of the home page's first-load bundle.
      const { toast } = await import('sonner');
      try {
        // First, straight from the tap: iOS asks only from a user gesture.
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          if (permission === 'denied') {
            setState('hidden');
          }
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes(publicKey),
        });
        const result = await subscribePushAction(subscription.toJSON());
        if (!result.success) {
          await subscription.unsubscribe();
          toast.error(result.error);
          return;
        }
        setState('hidden');
        toast.success('Erinnerungen sind eingeschaltet');
      } catch (error) {
        console.error('turning push messages on failed', error);
        toast.error('Mitteilungen konnten nicht eingeschaltet werden');
      }
    });
  }

  if (state === 'hidden') {
    return null;
  }

  return (
    <Banner
      icon={
        <BannerIcon>
          <BellRing />
        </BannerIcon>
      }
      title="Erinnerungen aktivieren"
      description={
        state === 'install'
          ? 'Auf dem iPhone kommen Mitteilungen nur in der App vom Home-Bildschirm an: Teilen › Zum Home-Bildschirm.'
          : 'Wir erinnern dich 3 und 7 Tage nach dem Dinner, falls du noch nicht bewertet hast.'
      }
      action={
        state === 'off' ? (
          <Button onClick={turnOn} disabled={pending}>
            {pending ? 'Einen Moment...' : 'Einschalten'}
          </Button>
        ) : undefined
      }
      onDismiss={dismiss}
    />
  );
}
