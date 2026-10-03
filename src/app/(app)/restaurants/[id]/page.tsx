import { ChevronLeft, Star } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { AvatarStack } from '@/components/avatar-stack';
import { EventCardUserRating } from '@/components/event-card-user-rating';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { RatingDialog } from '@/components/rating-dialog';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { calendarYear, displayCalendarDate } from '@/lib/calendar-date';
import { formatCurrency } from '@/lib/format';
import type { RestaurantDetail } from '@/lib/restaurant-detail';
import { displayName } from '@/lib/user';
import { verifySession } from '@/lib/verify-session';
import { getRestaurantDetail } from '@/services/restaurants';

type Props = {
  params: Promise<{ id: string }>;
};

/** Only the scores someone actually gave - legacy dinners have no categories. */
function scoreTiles(detail: RestaurantDetail): { title: string; value: number }[] {
  return [
    { title: 'Essen', value: detail.food },
    { title: 'Ambiente/Service', value: detail.ambience },
    { title: 'Preis-Leistung', value: detail.pricePerformance },
  ].filter((tile): tile is { title: string; value: number } => tile.value !== undefined);
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { session } = await verifySession();
  const { id } = await params;
  const result = await getRestaurantDetail(id, session.user.id);

  if (!result) {
    notFound();
  }

  const { event, detail, yearRank } = result;
  const assignedUsers = event.assignedUsers ?? [];
  const pickerName = event.pickedByUser ? displayName(event.pickedByUser) : null;
  const canRate =
    assignedUsers.some((user) => user.id === session.user.id) &&
    !event.ratings?.some((rating) => rating.userId === session.user.id);

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground" asChild>
        <NextLink href="/restaurants">
          <ChevronLeft />
          Restaurants
        </NextLink>
      </Button>
      <PageHeader
        title={event.restaurant}
        description={[displayCalendarDate(event.date), pickerName ? `gewählt von ${pickerName}` : null]
          .filter(Boolean)
          .join(' · ')}
      />

      <div className="space-y-10">
        {detail.ratingsHidden ? (
          <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground shadow-xs">
            Die Bewertungen aus {calendarYear(event.date)} gibt’s ab 1. Januar.
          </p>
        ) : detail.overall !== undefined ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="flex flex-col rounded-xl border bg-card p-3 shadow-xs sm:p-4">
              <p className="text-xs text-muted-foreground">Gesamt</p>
              <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold">
                <Star className="size-5 fill-star text-star" />
                {detail.overall.toFixed(1)}
              </p>
            </div>
            {scoreTiles(detail).map((tile) => (
              <div key={tile.title} className="flex flex-col rounded-xl border bg-card p-3 shadow-xs sm:p-4">
                <p className="text-xs text-muted-foreground">{tile.title}</p>
                <p className="mt-1 text-2xl font-bold">{tile.value.toFixed(1)}</p>
              </div>
            ))}
          </div>
        ) : null}

        <Section title="Details">
          <dl className="divide-y rounded-xl border bg-card px-4 shadow-xs">
            <DetailRow label="Datum">{displayCalendarDate(event.date)}</DetailRow>
            {pickerName ? <DetailRow label="Gewählt von">{pickerName}</DetailRow> : null}
            <DetailRow label="Gesamtkosten">{formatCurrency(event.totalCost)}</DetailRow>
            <DetailRow label="Pro Person">{formatCurrency(detail.costPerPerson)}</DetailRow>
            {assignedUsers.length > 0 ? (
              <DetailRow label="Teilnehmende">
                <span className="inline-flex items-center gap-2">
                  <AvatarStack users={assignedUsers} />
                  {assignedUsers.length}
                </span>
              </DetailRow>
            ) : null}
            {yearRank ? (
              <DetailRow label={`Rang ${yearRank.year}`}>
                Platz {yearRank.rank} von {yearRank.total}
              </DetailRow>
            ) : null}
            {detail.spread ? (
              <DetailRow label="Spannweite">
                {detail.spread.min.toFixed(1)} – {detail.spread.max.toFixed(1)}
              </DetailRow>
            ) : null}
          </dl>
        </Section>

        {detail.people.length > 0 ? (
          <Section
            title="Bewertungen"
            badge={
              <Badge variant="secondary">
                {detail.ratedCount} / {detail.people.length}
              </Badge>
            }
            action={canRate ? <RatingDialog eventId={event.id} trigger={<Button size="sm">Jetzt bewerten</Button>} /> : null}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {detail.people.map(({ person, rating }) => (
                <EventCardUserRating
                  key={person.id}
                  user={person}
                  userRating={rating}
                  isCurrentUser={person.id === session.user.id}
                  hideRatings={detail.ratingsHidden}
                />
              ))}
            </div>
          </Section>
        ) : null}
      </div>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
