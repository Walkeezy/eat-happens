import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  if (!user.isConfirmed) {
    redirect('/pending-confirmation');
  }

  return { session, user };
});

export const requireAdmin = async () => {
  const { session, user } = await verifySession();

  if (!user.isAdmin) {
    throw new Error('Nur Administratoren können diese Aktion ausführen');
  }

  return { session, user };
};

/** Page-level admin guard: redirects non-admins instead of throwing. */
export const requireAdminPage = async () => {
  const { session, user } = await verifySession();

  if (!user.isAdmin) {
    redirect('/');
  }

  return { session, user };
};
