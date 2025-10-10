import { StarIcon } from 'lucide-react';
import { FC } from 'react';

type Props = {
  score: number;
};

export const StarRating: FC<Props> = ({ score }) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className={`h-3 w-3 ${i < score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
};
