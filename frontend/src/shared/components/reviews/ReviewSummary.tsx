import * as React from 'react';
import { ReviewRatingStars } from './ReviewRatingStars';

interface ReviewSummaryProps {
  rating: number;
  totalReviews: number;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  rating,
  totalReviews,
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          {rating.toFixed(1)}
        </span>
        <span className="text-sm font-normal text-foregroundMuted">
          de 5
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <ReviewRatingStars rating={rating} sizeClassName="h-4 w-4" />
        <span className="text-xs text-foregroundMuted">
          {totalReviews.toLocaleString()} calificaciones
        </span>
      </div>
    </div>
  );
};
