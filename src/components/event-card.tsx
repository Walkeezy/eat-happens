import { RatingDialog } from '@/components/rating-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { event, rating } from '@/db/schema';
import { getUserFullName, getUserInitials } from '@/lib/user-utils';
import { InferSelectModel } from 'drizzle-orm';
import { CalendarIcon, StarIcon, UserIcon } from 'lucide-react';

// Inferred types - this component expects enriched event data
interface Event extends InferSelectModel<typeof event> {
  ratings?: (InferSelectModel<typeof rating> & {
    user?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      image?: string | null;
    };
  })[];
  averageRating?: number;
  totalRatings?: number;
  assignedUsers?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image?: string | null;
    isAdmin: boolean;
    isConfirmed: boolean;
  }[];
}

interface EventCardProps {
  event: Event;
  currentUserId: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className={`h-3 w-3 ${i < score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function EventCard({ event, currentUserId }: EventCardProps) {
  const isUserAssigned = event.assignedUsers?.some((user) => user.id === currentUserId);
  const userRating = event.ratings?.find((rating) => rating.userId === currentUserId);
  const hasUnratedAssignment = isUserAssigned && !userRating;

  // If user is assigned and hasn't rated, show rating interface
  if (hasUnratedAssignment) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold">{event.restaurant}</CardTitle>
              <CardDescription className="flex items-center space-x-2 text-sm">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(event.date)}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <RatingDialog event={event} isAssigned={true} trigger={<Button>Jetzt bewerten</Button>} />
        </CardContent>
      </Card>
    );
  }

  // For all other events, show assigned users with their ratings
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold">{event.restaurant}</CardTitle>
            <CardDescription className="flex items-center space-x-2 text-sm">
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDate(event.date)}</span>
            </CardDescription>
          </div>
          {event.averageRating && event.averageRating > 0 && (
            <div className="flex items-center space-x-1">
              <StarRating score={Math.round(event.averageRating)} />
              <span className="text-xs text-gray-600">
                {event.averageRating.toFixed(1)} ({event.totalRatings})
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Assigned Users with their ratings */}
        {event.assignedUsers && event.assignedUsers.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {event.assignedUsers.map((user) => {
                const userRating = event.ratings?.find((rating) => rating.userId === user.id);
                const userName = getUserFullName(user.firstName, user.lastName);
                const userInitials = getUserInitials(user.firstName, user.lastName);
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
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-3 text-center text-gray-500">
            <UserIcon className="mx-auto mb-1 h-6 w-6 text-gray-400" />
            <p className="text-sm">Keine Nutzer zugewiesen</p>
          </div>
        )}

        {/* Show rating dialog for assigned users who have already rated */}
        {isUserAssigned && userRating && (
          <RatingDialog
            event={event}
            isAssigned={true}
            existingRating={userRating}
            trigger={
              <Button variant="outline" size="sm">
                Bewerten
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
