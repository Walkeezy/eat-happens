import { StarIcon } from 'lucide-react';
import type { FC } from 'react';

type Props = {
  score: number;
};

export const StarRating: FC<Props> = ({ score }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, never-reordered list of 5 stars
          key={i}
          className={`size-3 ${i < score ? 'fill-star text-star' : 'text-muted-foreground/40'}`}
        />
      ))}
    </div>
  );
};
