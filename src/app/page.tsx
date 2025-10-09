import EventCard from '@/components/event-card';
import { auth } from '@/lib/auth';
import { getEventsWithRatingsAndAssignments } from '@/services/events';
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

  // Fetch events with ratings and assignments on the server
  const events = await getEventsWithRatingsAndAssignments();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Willkommen, {session.user.name}! 👋</h1>
        <p className="mt-2 text-gray-600">Hier sind alle Events und ihre Bewertungen</p>
      </div>

      {events.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-gray-500">
            <h2 className="mb-2 text-xl font-semibold">Keine Events gefunden</h2>
            <p>Es wurden noch keine Events erstellt.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} currentUserId={session.user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
