import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { StarRating } from '@/components/star-rating';
import { EventWithDetails } from '@/types/events';
import { Check, Star } from 'lucide-react';
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

const ratingCategories = [
  { key: 'foodScore', label: 'Essen' },
  { key: 'ambienceScore', label: 'Ambiente' },
  { key: 'pricePerformanceScore', label: 'Preis-Leistung' },
] as const;

export const EventCardUserRating: FC<Props> = ({ user, userRating, isCurrentUser, hideRatings }) => {
  const userName = user.name || user.email;
  const userInitials = getInitials(user.name);

  // Check if this is a multi-category rating (new system) or legacy rating
  const isMultiCategory = userRating?.foodScore !== null && userRating?.foodScore !== undefined;
  const hasRating = userRating && (isMultiCategory || (userRating.legacyScore ?? 0) > 0);

  // Calculate average of all 3 categories
  const averageRating =
    isMultiCategory && userRating
      ? ((userRating.foodScore ?? 0) + (userRating.ambienceScore ?? 0) + (userRating.pricePerformanceScore ?? 0)) / 3
      : null;

  // When ratings are hidden: show current user's own rating, show checkmark for others who rated
  const showScore = hasRating && (!hideRatings || isCurrentUser);
  const showCheckmark = hasRating && hideRatings && !isCurrentUser;

  return (
    <div className="flex space-x-2 rounded-lg bg-gray-50 p-2">
      <Avatar className="size-8">
        <AvatarImage src={user.image || undefined} alt={userName} />
        <AvatarFallback className="bg-primary/50 text-xs text-primary-foreground">{userInitials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{userName}</span>
          {showScore && isMultiCategory && averageRating !== null && (
            <div className="flex items-center gap-2">
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
        {showScore ? (
          isMultiCategory ? (
            <div className="mt-1 space-y-0.5">
              {ratingCategories.map(({ key, label }) => (
                <div key={key} className="grid grid-cols-[90px_auto] items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{label}:</span>
                  <StarRating score={userRating[key] ?? 0} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1">
              <StarRating score={userRating.legacyScore ?? 0} />
            </div>
          )
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
