import { describe, expect, it } from 'vitest';
import { notificationUrl, parsePushPayload } from './sw-push';

describe('parsePushPayload', () => {
  it('shows what the server sent', () => {
    const text = JSON.stringify({ title: "Wie war's im Rössli?", body: 'Noch nicht bewertet', url: '/' });

    expect(parsePushPayload(text)).toEqual({ title: "Wie war's im Rössli?", body: 'Noch nicht bewertet', url: '/' });
  });

  it('always shows something, so Safari keeps the subscription', () => {
    const fallback = { title: 'Eat Happens', body: 'Neue Mitteilung', url: '/' };

    expect(parsePushPayload(null)).toEqual(fallback);
    expect(parsePushPayload('not json')).toEqual(fallback);
    expect(parsePushPayload('{"body":"x"}')).toEqual({ title: 'Eat Happens', body: 'x', url: '/' });
  });

  it('opens nothing outside the app', () => {
    for (const url of ['https://evil.example', '//evil.example', '/\\evil.example', '/\t/evil.example', 'events']) {
      expect(parsePushPayload(JSON.stringify({ title: 't', body: 'b', url })).url).toBe('/');
    }
  });
});

describe('notificationUrl', () => {
  it('takes the path from the notification data', () => {
    expect(notificationUrl({ url: '/events' })).toBe('/events');
    expect(notificationUrl({ url: '//evil.example' })).toBe('/');
    expect(notificationUrl(null)).toBe('/');
  });
});
