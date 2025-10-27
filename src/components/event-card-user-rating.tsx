import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { StarRating } from '@/components/star-rating';
import { EventWithDetails } from '@/types/events';
import { Check } from 'lucide-react';
import { FC } from 'react';

type Props = {
  user: NonNullable<EventWithDetails['assignedUsers']>[number];
  userRating: NonNullable<EventWithDetails['ratings']>[number] | undefined;
  isCurrentUser: boolean;
  event: EventWithDetails;
  hideRatings: boolean;
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

export const EventCardUserRating: FC<Props> = ({ user, userRating, isCurrentUser, hideRatings }) => {
  const userName = user.name || user.email;
  const userInitials = getInitials(user.name);

  // When ratings are hidden: show current user's own rating, show checkmark for others who rated
  const showScore = userRating && (!hideRatings || isCurrentUser) && userRating.score > 0;
  const showCheckmark = userRating && hideRatings && !isCurrentUser;

  return (
    <div className="flex items-center space-x-2 rounded-lg bg-gray-50 p-2">
      <Avatar className="size-8">
        <AvatarImage src={user.image || undefined} alt={userName} />
        <AvatarFallback className="bg-primary/50 text-xs text-primary-foreground">{userInitials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <span className="truncate text-sm font-medium">{userName}</span>
        {showScore ? (
          <div className="mt-1">
            <StarRating score={userRating.score} />
          </div>
        ) : showCheckmark ? (
          <div className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-green-600">
            <Check className="size-3" />
            <span>Bewertet</span>
          </div>
        ) : (
          <div className="text-xs font-semibold text-muted-foreground">Noch nicht bewertet</div>
        )}
      </div>
    </div>
  );
};
