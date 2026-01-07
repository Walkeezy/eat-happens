'use client';

import { EventCardUserRating } from '@/components/event-card-user-rating';
import { RatingDialog } from '@/components/rating-dialog';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/shadcn/card';
import { dayjs } from '@/lib/dayjs';
import type { EventWithDetails } from '@/types/events';
import { CalendarIcon, Star, Wallet } from 'lucide-react';
import { FC } from 'react';

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
  const hasAssignedUsers = event.assignedUsers && event.assignedUsers.length > 0;

  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold">{event.restaurant}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-sm">
              <CalendarIcon className="size-3" />
              {dayjs(event.date).format('D. MMMM YYYY')}
            </CardDescription>
            {event.totalCost != null && (
              <CardDescription className="flex items-center gap-1 text-sm">
                <Wallet className="size-3" />
                CHF {event.totalCost.toFixed(2)} (Ø pro Person: CHF{' '}
                {(event.totalCost / event.assignedUsers!.length).toFixed(2)})
              </CardDescription>
            )}
          </div>
          {!hasUnratedAssignment && showAverageRating ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{averageRating!.toFixed(1)}</span>
              <Star className="size-6 fill-yellow-400 text-yellow-400" />
            </div>
          ) : null}
        </div>

        {hasUnratedAssignment ? (
          <RatingDialog mode="create" event={event} trigger={<Button>Jetzt bewerten</Button>} />
        ) : (
          hasAssignedUsers && (
            <div className="flex flex-col gap-2">
              {event.assignedUsers!.map((user) => (
                <EventCardUserRating
                  key={user.id}
                  user={user}
                  userRating={event.ratings?.find((rating) => rating.userId === user.id)}
                  isCurrentUser={user.id === currentUserId}
                  event={event}
                  hideRatings={hideRatings}
                />
              ))}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
