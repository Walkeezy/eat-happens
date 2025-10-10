import EventCard from '@/components/event-card';
import { AppLayout } from '@/components/layout/app-layout';
import { verifySession } from '@/lib/verify-session';
import { getEventsWithRatingsAndAssignments } from '@/services/events';

export default async function HomePage() {
  const { session } = await verifySession();

  // Fetch events with ratings and assignments on the server
  const events = await getEventsWithRatingsAndAssignments();

  return (
    <AppLayout>
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
    </AppLayout>
  );
}
