import { Star } from 'lucide-react';
import { FC, useState } from 'react';

type Props = {
  score: number;
  onScoreChange: (score: number) => void;
};

export const StarVoting: FC<Props> = ({ score, onScoreChange }) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="touch-manipulation rounded-sm p-2 transition-colors hover:bg-gray-100"
          onClick={() => onScoreChange(star)}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= (hoveredStar || score) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {score > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          {score} Stern{score !== 1 ? 'e' : ''}
        </span>
      )}
    </div>
  );
};
