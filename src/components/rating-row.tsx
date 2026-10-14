import { Check, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/avatar';
import { ratingCategories } from '@/lib/constants';
import { type RatingScores, ratingOverall } from '@/lib/scores';
import { cn } from '@/lib/shadcn-utils';
import { getInitials } from '@/lib/user';

type Props = {
  user: { name: string | null; email: string; image?: string | null };
  rating: RatingScores | undefined;
  isCurrentUser: boolean;
  /** This year's scores stay hidden; others only show that they rated, the current user still sees their own. */
  hideRatings: boolean;
  className?: string;
};

/** One person's verdict on a dinner, as a single list row: name, the category scores in a line, the overall on the right. */
export function RatingRow({ user, rating, isCurrentUser, hideRatings, className }: Props) {
  const overall = rating ? ratingOverall(rating) : null;
  const showScore = overall !== null && (!hideRatings || isCurrentUser);
  const hasCategories = rating?.foodScore !== null && rating?.foodScore !== undefined;

  let detail: ReactNode = null;
  if (showScore && rating && hasCategories) {
    detail = ratingCategories.map(({ key, shortLabel }) => `${shortLabel} ${rating[key]}`).join(' · ');
  } else if (rating && !showScore) {
    detail = (
      <span className="inline-flex items-center gap-0.5 font-medium text-success">
        <Check className="size-3" />
        Bewertet
      </span>
    );
  } else if (!rating) {
    detail = 'Noch nicht bewertet';
  }

  return (
    <li className={cn('flex min-h-12 items-center gap-3 px-4 py-2.5', className)}>
      <Avatar
        src={user.image}
        fallback={getInitials(user.name)}
        className="size-8"
        fallbackClassName="bg-primary/15 text-[11px] font-semibold text-primary"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {user.name ?? user.email}
          {isCurrentUser ? <span className="font-normal text-muted-foreground"> (du)</span> : null}
        </div>
        {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
      </div>
      {showScore ? (
        <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
          <Star className="size-3.5 fill-star text-star" />
          {overall.toFixed(1)}
        </div>
      ) : null}
    </li>
  );
}
