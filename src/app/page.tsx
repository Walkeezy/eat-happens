import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
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

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Willkommen, {session.user.name}! 👋</h1>
        <p className="text-gray-600">Du bist erfolgreich eingeloggt.</p>
      </div>
    </div>
  );
}
