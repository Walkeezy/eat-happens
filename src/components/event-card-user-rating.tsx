import { RatingDialog } from '@/components/rating-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { Button } from '@/components/shadcn/button';
import { StarRating } from '@/components/star-rating';
import { EventWithDetails } from '@/types/events';
import { PencilIcon } from 'lucide-react';
import { FC } from 'react';

type Props = {
  user: NonNullable<EventWithDetails['assignedUsers']>[number];
  userRating: NonNullable<EventWithDetails['ratings']>[number] | undefined;
  isCurrentUser: boolean;
  event: EventWithDetails;
};

const getInitials = (name: string | null) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export const EventCardUserRating: FC<Props> = ({ user, userRating, isCurrentUser, event }) => {
  const userName = user.name || user.email;
  const userInitials = getInitials(user.name);

  return (
    <div className="flex items-center space-x-2 rounded-lg bg-gray-50 p-2">
      <Avatar className="size-8">
        <AvatarImage src={user.image || undefined} alt={userName} />
        <AvatarFallback className="bg-primary/50 text-xs text-primary-foreground">{userInitials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <span className="truncate text-sm font-medium">{userName}</span>
        {userRating ? (
          <div className="mt-1">
            <StarRating score={userRating.score} />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Noch nicht bewertet</div>
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
};
