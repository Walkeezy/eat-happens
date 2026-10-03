import { CalendarOff } from 'lucide-react';
import { EventCard } from '@/components/event-card';
import { JahresrueckblickBanner } from '@/components/jahresrueckblick-banner';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { NextPickerBanner } from '@/components/next-picker-banner';
import { RateLastDinnerBanner } from '@/components/rate-last-dinner-banner';
import { Badge } from '@/components/shadcn/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';
import {
  calendarYear,
  groupByCalendarYear,
  isJanuary,
  previousCalendarYearRange,
  todayCalendarDate,
} from '@/lib/calendar-date';
import { determineNextPicker } from '@/lib/pick-rotation';
import { shouldHideRatings } from '@/lib/ratings-visibility';
import { displayName } from '@/lib/user';
import { verifySession } from '@/lib/verify-session';
import { getAllConfirmedUsers } from '@/services/assignments';
import { getEvents } from '@/services/events';

export default async function HomePage() {
  const { session } = await verifySession();
  const today = todayCalendarDate();
  const [events, confirmedUsers] = await Promise.all([
    getEvents({ upToDate: today, currentUserId: session.user.id }),
    getAllConfirmedUsers(),
  ]);
  const nextPicker = determineNextPicker(confirmedUsers, events);
  const previousYear = previousCalendarYearRange(today).year;
  const showRevealBanner = isJanuary(today) && events.some((event) => calendarYear(event.date) === previousYear);

  const lastAssignedEvent = events.find((event) => event.assignedUsers?.some((user) => user.id === session.user.id));
  const lastDinnerNeedsRating =
    lastAssignedEvent !== undefined && !lastAssignedEvent.ratings?.some((rating) => rating.userId === session.user.id);

  // The most recent unrated dinner is promoted into RateLastDinnerBanner, so it must not
  // also appear in the grid below - otherwise the same dinner shows up twice in a row.
  const isPromotedToBanner = (eventId: string) => lastDinnerNeedsRating && eventId === lastAssignedEvent?.id;

  const unratedEvents = events.filter((event) => {
    const isUserAssigned = event.assignedUsers?.some((user) => user.id === session.user.id);
    const userRating = event.ratings?.find((rating) => rating.userId === session.user.id);

    return isUserAssigned && !userRating && !isPromotedToBanner(event.id);
  });

  const otherEvents = events.filter((event) => {
    const isUserAssigned = event.assignedUsers?.some((user) => user.id === session.user.id);
    const userRating = event.ratings?.find((rating) => rating.userId === session.user.id);

    return (!isUserAssigned || userRating) && !isPromotedToBanner(event.id);
  });

  const renderGrid = (gridEvents: typeof events) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {gridEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          currentUserId={session.user.id}
          hideRatings={shouldHideRatings(event.date)}
        />
      ))}
    </div>
  );

  return (
    <>
      <PageHeader title={`Hoi ${displayName(session.user)}`} />

      <div className="space-y-3">
        <NextPickerBanner {...nextPicker} />
        {showRevealBanner ? <JahresrueckblickBanner year={previousYear} /> : null}
        {lastDinnerNeedsRating && lastAssignedEvent ? <RateLastDinnerBanner event={lastAssignedEvent} /> : null}
      </div>

      {events.length === 0 ? (
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarOff />
            </EmptyMedia>
            <EmptyTitle>Keine Events gefunden</EmptyTitle>
            <EmptyDescription>Es wurden noch keine Events erstellt.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-8 space-y-8">
          {unratedEvents.length > 0 && (
            <Section title="Zum Bewerten" badge={<Badge>{unratedEvents.length}</Badge>}>
              {renderGrid(unratedEvents)}
            </Section>
          )}

          {otherEvents.length > 0 && (
            <Section
              title={unratedEvents.length > 0 ? 'Alle anderen Events' : 'Alle Events'}
              badge={<Badge variant="outline">{otherEvents.length}</Badge>}
            >
              <div className="space-y-2">
                {groupByCalendarYear(otherEvents).map(({ year, items }) => (
                  <div key={year}>
                    <h3 className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 bg-muted/85 px-4 py-2 text-sm font-semibold text-muted-foreground backdrop-blur-lg sm:-mx-6 sm:px-6">
                      {year}
                    </h3>
                    {renderGrid(items)}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </>
  );
}
