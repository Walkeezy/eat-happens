import { cn } from '@/lib/shadcn-utils';
import { Star } from 'lucide-react';
import { FC, useState } from 'react';

type Props = {
  score: number;
  onScoreChange: (score: number) => void;
};

export const StarVoting: FC<Props> = ({ score, onScoreChange }) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  return (
    <div className="flex items-center justify-center gap-2 rounded-md bg-gray-50">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className="touch-manipulation rounded-sm p-2"
          onClick={() => onScoreChange(star)}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
        >
          <Star
            className={cn(
              'size-8 transition-all active:scale-125',
              star <= (hoveredStar || score) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  );
};
