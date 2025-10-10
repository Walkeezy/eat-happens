import { EventCard } from '@/components/event-card';
import { AppLayout } from '@/components/layout/app-layout';
import { Badge } from '@/components/shadcn/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';
import { verifySession } from '@/lib/verify-session';
import { getEvents } from '@/services/events';
import { CalendarOff } from 'lucide-react';

export default async function HomePage() {
  const { session } = await verifySession();

  // Fetch events with ratings and assignments on the server
  const events = await getEvents();

  // Separate events into unrated (assigned but not rated) and all others
  const unratedEvents = events.filter((event) => {
    const isUserAssigned = event.assignedUsers?.some((user) => user.id === session.user.id);
    const userRating = event.ratings?.find((rating) => rating.userId === session.user.id);

    return isUserAssigned && !userRating;
  });

  const otherEvents = events.filter((event) => {
    const isUserAssigned = event.assignedUsers?.some((user) => user.id === session.user.id);
    const userRating = event.ratings?.find((rating) => rating.userId === session.user.id);

    return !isUserAssigned || userRating;
  });

  return (
    <AppLayout>
      {events.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarOff />
            </EmptyMedia>
            <EmptyTitle>Keine Events gefunden</EmptyTitle>
            <EmptyDescription>Es wurden noch keine Events erstellt.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-8">
          {/* Events to Rate Section */}
          {unratedEvents.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold">Events zum Bewerten</h2>
                <Badge>{unratedEvents.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {unratedEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentUserId={session.user.id} />
                ))}
              </div>
            </div>
          )}

          {/* All Other Events Section */}
          {otherEvents.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold">{unratedEvents.length > 0 ? 'Alle anderen Events' : 'Alle Events'}</h2>
                <Badge variant="outline">{unratedEvents.length > 0 ? otherEvents.length : events.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {otherEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentUserId={session.user.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
