'use client';

import { CalendarIcon, ChevronDown, Star, UserRound, Wallet } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { AvatarStack } from '@/components/avatar-stack';
import { EventCardUserRating } from '@/components/event-card-user-rating';
import { RatingDialog } from '@/components/rating-dialog';
import { Button } from '@/components/shadcn/button';
import { Card } from '@/components/shadcn/card';
import { displayCalendarDate } from '@/lib/calendar-date';
import { formatCurrency } from '@/lib/format';
import { displayName } from '@/lib/user';
import type { EventWithDetails } from '@/types/events';

type Props = {
  event: EventWithDetails;
  currentUserId: string;
  hideRatings: boolean;
};

export const EventCard: FC<Props> = ({ event, currentUserId, hideRatings }) => {
  const isUserAssigned = event.assignedUsers?.some((user) => user.id === currentUserId);
  const userRating = event.ratings?.find((rating) => rating.userId === currentUserId);
  const hasUnratedAssignment = isUserAssigned && !userRating;

  // Calculate average rating - either from category ratings or legacy
  const categoryRatings = [event.averageFoodRating, event.averageAmbienceRating, event.averagePricePerformanceRating].filter(
    (v): v is number => v !== undefined,
  );
  const averageRating =
    categoryRatings.length > 0
      ? categoryRatings.reduce((sum, v) => sum + v, 0) / categoryRatings.length
      : event.averageLegacyRating;

  const showAverageRating = !hideRatings && averageRating !== undefined && averageRating > 0;
  const assignedUsers = event.assignedUsers ?? [];
  const hasAssignedUsers = assignedUsers.length > 0;
  const ratedCount = assignedUsers.filter((user) => event.ratings?.some((rating) => rating.userId === user.id)).length;

  return (
    <Card className="h-full gap-0 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 leading-snug font-semibold">{event.restaurant}</h3>
        {!hasUnratedAssignment && showAverageRating ? (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-star/15 px-2 py-0.5 text-sm font-bold">
            <Star className="size-3.5 fill-star text-star" />
            {averageRating.toFixed(1)}
          </div>
        ) : null}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Meta icon={<CalendarIcon />}>{displayCalendarDate(event.date)}</Meta>
        {event.totalCost !== null && (
          <Meta icon={<Wallet />}>
            {formatCurrency(event.totalCost)}
            {hasAssignedUsers && ` · Ø ${formatCurrency(Number(event.totalCost) / assignedUsers.length)}`}
          </Meta>
        )}
        {event.pickedByUser && <Meta icon={<UserRound />}>{displayName(event.pickedByUser)}</Meta>}
      </div>

      {hasUnratedAssignment ? (
        <div className="mt-auto pt-4">
          <RatingDialog event={event} trigger={<Button className="w-full">Jetzt bewerten</Button>} />
        </div>
      ) : (
        hasAssignedUsers && (
          <details className="group mt-auto pt-3">
            <summary className="-mx-2 flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted [&::-webkit-details-marker]:hidden">
              <AvatarStack users={assignedUsers} />
              <span className="text-xs text-muted-foreground">
                {ratedCount} / {assignedUsers.length} bewertet
              </span>
              <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2 flex flex-col gap-1.5">
              {assignedUsers.map((user) => (
                <EventCardUserRating
                  key={user.id}
                  user={user}
                  userRating={event.ratings?.find((rating) => rating.userId === user.id)}
                  isCurrentUser={user.id === currentUserId}
                  hideRatings={hideRatings}
                />
              ))}
            </div>
          </details>
        )
      )}
    </Card>
  );
};

function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 [&_svg]:size-3 [&_svg]:shrink-0">
      {icon}
      {children}
    </span>
  );
}
