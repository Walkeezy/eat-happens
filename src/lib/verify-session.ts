import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { AppError } from '@/lib/action-result';
import { auth } from '@/lib/auth';

/**
 * Reads the session once per request and freshness. `fresh` skips better-auth's signed cookie cache and asks the
 * database, which is what every mutation and admin check does, so revoked access takes effect immediately.
 */
const loadSession = cache(async (fresh: boolean) =>
  auth.api.getSession({
    headers: await headers(),
    query: fresh ? { disableCookieCache: true } : undefined,
  }),
);

async function verify(fresh: boolean) {
  let session = await loadSession(fresh);

  // Right after an admin confirms an account the cookie cache still says "not confirmed" - check the database
  // before sending someone to the waiting page, which would otherwise bounce them straight back.
  if (session && !session.user.isConfirmed && !fresh) {
    session = await loadSession(true);
  }

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  if (!user.isConfirmed) {
    redirect('/pending-confirmation');
  }

  return { session, user };
}

/** For rendering pages: may answer from the cookie cache, which saves a database round trip on most requests. */
export const verifySession = () => verify(false);

/** For server actions that write: always checks the database. */
export const verifySessionForAction = () => verify(true);

export const requireAdmin = async () => {
  const { session, user } = await verify(true);

  if (!user.isAdmin) {
    throw new AppError('Nur Administratoren können diese Aktion ausführen');
  }

  return { session, user };
};

/** Page-level admin guard: redirects non-admins instead of throwing. */
export const requireAdminPage = async () => {
  const { session, user } = await verify(true);

  if (!user.isAdmin) {
    redirect('/');
  }

  return { session, user };
};
