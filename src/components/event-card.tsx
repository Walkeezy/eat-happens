import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { Badge } from '@/components/shadcn/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { event, rating } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { CalendarIcon, StarIcon, UserIcon } from 'lucide-react';

// Inferred types - this component expects enriched event data
interface Event extends InferSelectModel<typeof event> {
  ratings?: (InferSelectModel<typeof rating> & {
    user?: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  })[];
  averageRating?: number;
  totalRatings?: number;
  assignedUsers?: {
    id: string;
    name: string;
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

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
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

  return (
    <Card className={`relative ${hasUnratedAssignment ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">{event.restaurant}</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </CardDescription>
          </div>
          {event.averageRating && event.averageRating > 0 && (
            <div className="flex items-center space-x-2">
              <StarRating score={Math.round(event.averageRating)} />
              <span className="text-sm text-gray-600">
                {event.averageRating.toFixed(1)} ({event.totalRatings})
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assigned Users */}
        {event.assignedUsers && event.assignedUsers.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center space-x-1 text-sm font-medium">
              <UserIcon className="h-4 w-4" />
              <span>Zugewiesene Nutzer</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.assignedUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 rounded-lg bg-gray-50 p-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="text-xs">{getUserInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                  {user.id === currentUserId && (
                    <Badge variant="secondary" className="text-xs">
                      Du
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ratings */}
        {event.ratings && event.ratings.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center space-x-1 text-sm font-medium">
              <StarIcon className="h-4 w-4" />
              <span>Bewertungen</span>
            </h4>
            <div className="space-y-2">
              {event.ratings.map((rating) => (
                <div key={rating.id} className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={rating.user?.image || undefined} alt={rating.user?.name} />
                    <AvatarFallback className="text-xs">
                      {rating.user?.name ? getUserInitials(rating.user.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{rating.user?.name}</span>
                      <StarRating score={rating.score} />
                      {rating.userId === currentUserId && (
                        <Badge variant="secondary" className="text-xs">
                          Du
                        </Badge>
                      )}
                    </div>
                    {rating.comment && <p className="mt-1 text-sm text-gray-600">{rating.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Rating Alert */}
        {hasUnratedAssignment && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-orange-800">
                Du bist diesem Event zugewiesen, hast aber noch keine Bewertung abgegeben
              </span>
            </div>
          </div>
        )}

        {/* No Assignments */}
        {(!event.assignedUsers || event.assignedUsers.length === 0) && (
          <div className="py-4 text-center text-gray-500">
            <UserIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm">Keine Nutzer zugewiesen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
