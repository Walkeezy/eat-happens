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

  const user = session.user as typeof session.user & { isConfirmed: boolean };

  if (!user.isConfirmed) {
    redirect('/pending-confirmation');
  }

  return { session, user };
});
