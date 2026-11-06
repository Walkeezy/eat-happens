import { describe, expect, it } from 'vitest';
import { subscriptionSchema } from './push-subscription';

describe('subscriptionSchema', () => {
  const subscription = {
    endpoint: 'https://web.push.apple.com/QGx',
    expirationTime: null,
    keys: { p256dh: 'BPx', auth: 'k3y' },
  };

  const takes = (endpoint: string) => subscriptionSchema.safeParse({ ...subscription, endpoint }).success;

  it('takes what PushSubscription.toJSON() gives', () => {
    expect(subscriptionSchema.parse(subscription)).toEqual({
      endpoint: 'https://web.push.apple.com/QGx',
      keys: { p256dh: 'BPx', auth: 'k3y' },
    });
  });

  it('refuses a push service without https or keys', () => {
    expect(takes('http://web.push.apple.com/x')).toBe(false);
    expect(subscriptionSchema.safeParse({ endpoint: subscription.endpoint }).success).toBe(false);
  });

  it('takes the browsers’ push services and nothing else', () => {
    expect(takes('https://fcm.googleapis.com/fcm/send/abc')).toBe(true);
    expect(takes('https://updates.push.services.mozilla.com/wpush/v2/abc')).toBe(true);
    expect(takes('https://wns2-par02p.notify.windows.com/w/?token=abc')).toBe(true);
    expect(takes('https://internal.example/x')).toBe(false);
    expect(takes('https://push.apple.com.evil.example/x')).toBe(false);
    expect(takes('https://evilpush.apple.com/x')).toBe(false);
    expect(takes('not a url')).toBe(false);
  });
});
