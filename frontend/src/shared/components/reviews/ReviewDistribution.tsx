import * as React from 'react';
import type { RatingDistributionItem } from './review.types';

interface ReviewDistributionProps {
  distribution: RatingDistributionItem[];
  totalReviews?: number;
}

export const ReviewDistribution: React.FC<ReviewDistributionProps> = ({
  distribution,
  totalReviews = 142,
}) => {
  // Max count to scale bar smoothly or based on total reviews
  const maxCount = React.useMemo(() => {
    return Math.max(...distribution.map((d) => d.count), 1);
  }, [distribution]);

  return (
    <div className="space-y-2.5 pt-3">
      {distribution.map((item) => {
        const label = item.rating === 1 ? '1 estrella' : `${item.rating} estrellas`;
        // Width relative to max count or total reviews (in reference image, 5 stars 74 fills ~75% of the bar)
        const barWidth =
          item.percent !== undefined
            ? item.percent
            : totalReviews > 0
            ? Math.round((item.count / totalReviews) * 100)
            : Math.round((item.count / maxCount) * 100);

        return (
          <div
            key={item.rating}
            className="flex items-center gap-3 text-xs"
          >
            {/* Star label */}
            <span className="w-18 shrink-0 text-[#374151] font-normal">
              {label}
            </span>

            {/* Horizontal progress bar */}
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(2, barWidth))}%` }}
              />
            </div>

            {/* Exact count on the right (NO percentage, matching reference) */}
            <span className="w-7 shrink-0 text-right text-xs text-[#6B7280]">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
};
