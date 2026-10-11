'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { safeRedirectPath } from '@/lib/safe-redirect';

/**
 * Starts the Google sign-in on the server and sends the browser to Google. Running it as a server action keeps
 * the better-auth client out of the browser bundle; the `nextCookies()` plugin applies the OAuth state cookie.
 */
export async function signInWithGoogleAction(formData: FormData) {
  const next = safeRedirectPath(formData.get('next'));
  let url: string | undefined;

  try {
    const result = await auth.api.signInSocial({
      body: { provider: 'google', callbackURL: next, errorCallbackURL: '/login?error=1' },
      headers: await headers(),
    });
    url = result.url;
  } catch (error) {
    console.error('Google sign-in could not be started', error);
  }

  redirect(url ?? '/login?error=1');
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
