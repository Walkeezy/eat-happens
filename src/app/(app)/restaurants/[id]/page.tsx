import { Star } from 'lucide-react';
import { notFound } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';
import { AvatarStack } from '@/components/avatar-stack';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { ListGroup } from '@/components/list-group';
import { RatingDialog } from '@/components/rating-dialog';
import { RatingRow } from '@/components/rating-row';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { calendarYear, displayCalendarDate } from '@/lib/calendar-date';
import { ratingCategories } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';
import type { RestaurantDetail } from '@/lib/restaurant-detail';
import { displayName } from '@/lib/user';
import { verifySession } from '@/lib/verify-session';
import { getRestaurantDetail, getYearRank } from '@/services/restaurants';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailPage({ params }: Props) {
  // The dinner query starts as soon as the id is known; only the ratings-visibility step waits for the session.
  const sessionPromise = verifySession();
  const { id } = await params;
  const [{ session }, result] = await Promise.all([
    sessionPromise,
    getRestaurantDetail(
      id,
      sessionPromise.then(({ user }) => user.id),
    ),
  ]);

  if (!result) {
    notFound();
  }

  const { event, detail } = result;
  const assignedUsers = event.assignedUsers ?? [];
  const pickerName = event.pickedByUser ? displayName(event.pickedByUser) : null;
  const canRate =
    assignedUsers.some((user) => user.id === session.user.id) &&
    !event.ratings?.some((rating) => rating.userId === session.user.id);

  return (
    <>
      <PageHeader
        back
        title={event.restaurant}
        description={[displayCalendarDate(event.date), pickerName ? `gewählt von ${pickerName}` : null]
          .filter(Boolean)
          .join(' · ')}
      />

      <div className="space-y-6">
        {canRate ? (
          <RatingDialog
            eventId={event.id}
            trigger={
              <Button size="lg" className="w-full sm:w-auto">
                <Star />
                Jetzt bewerten
              </Button>
            }
          />
        ) : null}

        {detail.ratingsHidden ? (
          <p className="text-sm text-muted-foreground">
            Die Bewertungen aus {calendarYear(event.date)} gibt’s ab 1. Januar.
          </p>
        ) : detail.overall !== undefined ? (
          <ScoreCard detail={detail} overall={detail.overall} />
        ) : null}

        <ListGroup>
          {event.totalCost === null ? null : (
            <InfoRow label="Kosten">
              {formatCurrency(event.totalCost)}
              {detail.costPerPerson === null ? null : (
                <span className="font-normal text-muted-foreground"> · {formatCurrency(detail.costPerPerson)} p.P.</span>
              )}
            </InfoRow>
          )}
          {assignedUsers.length > 0 ? (
            <InfoRow label="Teilnehmende">
              <span className="inline-flex items-center gap-2">
                <AvatarStack users={assignedUsers} />
                {assignedUsers.length}
              </span>
            </InfoRow>
          ) : null}
          {/* Last, so the row streaming in later does not push the others around. */}
          <Suspense fallback={null}>
            <YearRankRow eventId={event.id} date={event.date} />
          </Suspense>
        </ListGroup>

        {detail.people.length > 0 ? (
          <Section
            title="Bewertungen"
            badge={
              <Badge variant="secondary">
                {detail.ratedCount} / {detail.people.length}
              </Badge>
            }
          >
            <ListGroup>
              {detail.people.map(({ person, rating }) => (
                <RatingRow
                  key={person.id}
                  user={person}
                  rating={rating}
                  isCurrentUser={person.id === session.user.id}
                  hideRatings={detail.ratingsHidden}
                />
              ))}
            </ListGroup>
          </Section>
        ) : null}
      </div>
    </>
  );
}

/** The group's verdict at a glance: the overall score large, the categories beside it, how it came about below. */
function ScoreCard({ detail, overall }: { detail: RestaurantDetail; overall: number }) {
  // Only the categories someone actually scored - legacy dinners have none.
  const scored: { label: string; value: number | undefined }[] = [
    { label: ratingCategories[0].shortLabel, value: detail.food },
    { label: ratingCategories[1].shortLabel, value: detail.ambience },
    { label: ratingCategories[2].shortLabel, value: detail.pricePerformance },
  ];
  const categories = scored.filter((category): category is { label: string; value: number } => category.value !== undefined);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-3xl leading-none font-bold">
            <Star className="size-6 fill-star text-star" />
            {overall.toFixed(1)}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">Gesamt</p>
        </div>
        {categories.length > 0 ? (
          <dl className="flex gap-5 text-center sm:gap-8">
            {categories.map((category) => (
              <div key={category.label}>
                <dd className="text-lg leading-none font-semibold">{category.value.toFixed(1)}</dd>
                <dt className="mt-1.5 text-xs text-muted-foreground">{category.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
        {detail.ratedCount} von {detail.people.length} bewertet
        {detail.spread ? ` · Spannweite ${detail.spread.min.toFixed(1)} – ${detail.spread.max.toFixed(1)}` : null}
      </p>
    </div>
  );
}

async function YearRankRow({ eventId, date }: { eventId: string; date: string }) {
  const yearRank = await getYearRank(eventId, date);
  if (!yearRank) {
    return null;
  }

  return (
    <InfoRow label={`Rang ${yearRank.year}`}>
      {yearRank.rank}. von {yearRank.total}
    </InfoRow>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </li>
  );
}
