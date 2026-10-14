import * as React from 'react';
import { Star } from 'lucide-react';

interface ReviewRatingStarsProps {
  rating: number;
  sizeClassName?: string;
  className?: string;
}

export const ReviewRatingStars: React.FC<ReviewRatingStarsProps> = ({
  rating,
  sizeClassName = 'h-3.5 w-3.5',
  className = '',
}) => {
  const roundedRating = Math.round(rating);

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < roundedRating;
        return (
          <Star
            key={index}
            className={`${sizeClassName} ${
              isFilled ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-borderStrong'
            }`}
          />
        );
      })}
    </div>
  );
};
