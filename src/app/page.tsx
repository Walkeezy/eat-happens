import { EventCard } from '@/components/event-card';
import { AppLayout } from '@/components/layout/app-layout';
import { Badge } from '@/components/shadcn/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';
import { dayjs } from '@/lib/dayjs';
import { shouldHideRatings } from '@/lib/ratings-visibility';
import { verifySession } from '@/lib/verify-session';
import { getEvents } from '@/services/events';
import { CalendarOff } from 'lucide-react';

export default async function HomePage() {
  const { session } = await verifySession();
  const events = await getEvents({ upToDate: dayjs().startOf('day').toDate() });

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
                <h2 className="text-lg font-semibold">Deine Events zum Bewerten</h2>
                <Badge>{unratedEvents.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {unratedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    currentUserId={session.user.id}
                    hideRatings={shouldHideRatings(event.date)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Other Events Section */}
          {otherEvents.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{unratedEvents.length > 0 ? 'Alle anderen Events' : 'Alle Events'}</h2>
                <Badge variant="outline">{unratedEvents.length > 0 ? otherEvents.length : events.length}</Badge>
              </div>
              {Object.entries(
                otherEvents.reduce<Record<string, typeof otherEvents>>((acc, event) => {
                  const year = dayjs(event.date).year().toString();
                  (acc[year] ??= []).push(event);

                  return acc;
                }, {}),
              )
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, yearEvents]) => (
                  <div key={year}>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">{year}</h3>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                      {yearEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          currentUserId={session.user.id}
                          hideRatings={shouldHideRatings(event.date)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
