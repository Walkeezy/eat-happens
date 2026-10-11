'use server';

import { parseSetCookieHeader } from 'better-auth/cookies';
import type { Route } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { safeRedirectPath } from '@/lib/safe-redirect';

/**
 * Copies the cookies better-auth wants to set onto the server action's response. Done by hand for the two actions
 * that need it: better-auth's `nextCookies()` plugin would also run on every session check and write a probe
 * cookie, and any cookie write makes Next re-render the page after each server action, even a failed one.
 */
async function applyAuthCookies(responseHeaders: Headers) {
  const setCookie = responseHeaders.get('set-cookie');
  if (!setCookie) {
    return;
  }

  const store = await cookies();
  parseSetCookieHeader(setCookie).forEach((cookie, name) => {
    store.set(name, decodeURIComponent(cookie.value), {
      sameSite: cookie.samesite,
      secure: cookie.secure,
      maxAge: cookie['max-age'],
      httpOnly: cookie.httponly,
      domain: cookie.domain,
      path: cookie.path,
    });
  });
}

/** Starts the Google sign-in on the server and sends the browser to Google, so the browser needs no auth client. */
export async function signInWithGoogleAction(formData: FormData) {
  const next = safeRedirectPath(formData.get('next'));
  let url: string | undefined;

  try {
    const { headers: responseHeaders, response } = await auth.api.signInSocial({
      body: { provider: 'google', callbackURL: next, errorCallbackURL: '/login?error=1' },
      headers: await headers(),
      returnHeaders: true,
    });
    await applyAuthCookies(responseHeaders);
    url = response.url;
  } catch (error) {
    console.error('Google sign-in could not be started', error);
  }

  // Google's authorization URL is external, so it is not one of the app's typed routes.
  redirect((url ?? '/login?error=1') as Route);
}

export async function signOutAction() {
  const { headers: responseHeaders } = await auth.api.signOut({ headers: await headers(), returnHeaders: true });
  await applyAuthCookies(responseHeaders);
  redirect('/login');
}
