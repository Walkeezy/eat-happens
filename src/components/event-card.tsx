'use client';

import { RatingDialog } from '@/components/rating-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { StarRating } from '@/components/star-rating';
import { dayjs } from '@/lib/dayjs';
import { getUserFullName, getUserInitials } from '@/lib/user-utils';
import type { EventWithDetails } from '@/types/events';
import { CalendarIcon, PencilIcon } from 'lucide-react';
import { FC } from 'react';

type Props = {
  event: EventWithDetails;
  currentUserId: string;
};

export const EventCard: FC<Props> = ({ event, currentUserId }) => {
  const isUserAssigned = event.assignedUsers?.some((user) => user.id === currentUserId);
  const userRating = event.ratings?.find((rating) => rating.userId === currentUserId);
  const hasUnratedAssignment = isUserAssigned && !userRating;

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold">{event.restaurant}</CardTitle>
            <CardDescription className="flex items-center space-x-2 text-sm">
              <CalendarIcon className="h-3 w-3" />
              <span>{dayjs(event.date).format('D. MMMM YYYY')}</span>
            </CardDescription>
          </div>
          {!hasUnratedAssignment && event.averageRating && event.averageRating > 0 && (
            <div className="flex items-center space-x-1">
              <StarRating score={Math.round(event.averageRating)} />
              <span className="text-xs text-gray-600">
                {event.averageRating.toFixed(1)} ({event.totalRatings})
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Show rating button for assigned users who haven't rated yet */}
        {hasUnratedAssignment && <RatingDialog mode="create" event={event} trigger={<Button>Jetzt bewerten</Button>} />}

        {/* Assigned Users with their ratings */}
        {!hasUnratedAssignment && event.assignedUsers && event.assignedUsers.length > 0 && (
          <div className="flex flex-col gap-2">
            {event.assignedUsers.map((user) => {
              const userRating = event.ratings?.find((rating) => rating.userId === user.id);
              const userName = getUserFullName(user.firstName, user.lastName);
              const userInitials = getUserInitials(user.firstName, user.lastName);
              const isCurrentUser = user.id === currentUserId;
              return (
                <div key={user.id} className="flex min-h-[44px] items-center space-x-2 rounded-lg bg-gray-50 p-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.image || undefined} alt={userName} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="truncate text-sm font-medium">{userName}</span>
                    </div>
                    {userRating ? (
                      <div className="mt-1 flex items-center space-x-1">
                        <StarRating score={userRating.score} />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Noch nicht bewertet</span>
                    )}
                  </div>
                  {isCurrentUser && userRating && (
                    <RatingDialog
                      mode="edit"
                      event={event}
                      existingRating={userRating}
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <PencilIcon />
                          <span className="sr-only">Bewertung bearbeiten</span>
                        </Button>
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
