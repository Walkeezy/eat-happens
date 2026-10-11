import type { FC } from 'react';
import { cn } from '@/lib/shadcn-utils';

const STAR_SYMBOL_ID = 'icon-star';

/**
 * The lucide star, defined once per page. Every `StarRating` references it with `<use>`, which keeps a card
 * with six people's category scores at ~100 bytes per star instead of a full inline path each time.
 */
export const StarSymbol: FC = () => (
  <svg className="absolute size-0" aria-hidden="true">
    <symbol id={STAR_SYMBOL_ID} viewBox="0 0 24 24">
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </symbol>
  </svg>
);

type Props = {
  score: number;
};

export const StarRating: FC<Props> = ({ score }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, never-reordered list of 5 stars
          key={i}
          className={cn('icon-star size-3', i < score ? 'fill-star text-star' : 'fill-none text-muted-foreground/40')}
          aria-hidden="true"
        >
          <use href={`#${STAR_SYMBOL_ID}`} />
        </svg>
      ))}
    </div>
  );
};
