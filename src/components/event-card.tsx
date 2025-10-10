'use client';

import { EventCardUserRating } from '@/components/event-card-user-rating';
import { RatingDialog } from '@/components/rating-dialog';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/shadcn/card';
import { dayjs } from '@/lib/dayjs';
import type { EventWithDetails } from '@/types/events';
import { CalendarIcon, Star } from 'lucide-react';
import { FC } from 'react';

type Props = {
  event: EventWithDetails;
  currentUserId: string;
};

export const EventCard: FC<Props> = ({ event, currentUserId }) => {
  const isUserAssigned = event.assignedUsers?.some((user) => user.id === currentUserId);
  const userRating = event.ratings?.find((rating) => rating.userId === currentUserId);
  const hasUnratedAssignment = isUserAssigned && !userRating;
  const showAverageRating = event.averageRating && event.averageRating > 0;
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
          </div>
          {!hasUnratedAssignment && showAverageRating && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{event.averageRating!.toFixed(1)}</span>
              <Star className="size-6 fill-yellow-400 text-yellow-400" />
            </div>
          )}
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
                />
              ))}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
