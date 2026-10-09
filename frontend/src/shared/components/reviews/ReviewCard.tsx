import * as React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Avatar } from '@/shared/ui/avatar';
import { ReviewRatingStars } from './ReviewRatingStars';
import type { ReviewItem } from './review.types';

interface ReviewCardProps {
  review: ReviewItem;
  onOpenImage: (review: ReviewItem, imageIndex: number) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onOpenImage }) => {
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpfulCount ?? 0);
  const [userVote, setUserVote] = React.useState<'yes' | 'no' | null>(null);

  const handleVoteYes = () => {
    if (userVote === 'yes') {
      setUserVote(null);
      setHelpfulCount((prev) => Math.max(0, prev - 1));
    } else {
      setHelpfulCount((prev) => (userVote === 'no' ? prev + 1 : prev + 1));
      setUserVote('yes');
    }
  };

  const handleVoteNo = () => {
    if (userVote === 'no') {
      setUserVote(null);
    } else {
      if (userVote === 'yes') {
        setHelpfulCount((prev) => Math.max(0, prev - 1));
      }
      setUserVote('no');
    }
  };

  const avatarFallback =
    review.user.fallback ||
    review.user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <article className="border-b border-border pb-6 pt-1 last:border-b-0 last:pb-0">
      {/* User Header */}
      <div className="flex items-center gap-3">
        <Avatar
          src={review.user.avatar}
          alt={review.user.name}
          fallback={avatarFallback}
          className="h-10 w-10 rounded-full border border-border bg-surfaceStrong text-xs font-bold text-foreground"
        />
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-foreground">
            {review.user.name}
          </h4>
          <div className="mt-0.5 flex items-center gap-2">
            <ReviewRatingStars rating={review.rating} sizeClassName="h-3.5 w-3.5" />
            <span className="text-[11px] text-foregroundMuted">
              · {review.date}
            </span>
          </div>
        </div>
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="mt-3 text-xs sm:text-sm font-bold text-foreground">
          {review.title}
        </h5>
      )}

      {/* Review Comment */}
      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-foregroundMuted">
        {review.comment}
      </p>

      {/* Customer uploaded photos thumbnails (if any) */}
      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2.5">
          {review.images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenImage(review, idx)}
              aria-label={`Ver foto ${idx + 1} de la reseña`}
              className="group relative h-20 w-20 sm:h-22 sm:w-22 overflow-hidden rounded-[5px] border border-border bg-surfaceMuted transition-transform hover:scale-102 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            >
              <img
                src={img}
                alt={`Foto del comprador ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Helpful controls */}
      <div className="mt-3 flex items-center gap-3 text-xs text-foregroundMuted">
        <span className="text-[11px] sm:text-xs">¿Te resultó útil?</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleVoteYes}
            className={`inline-flex items-center gap-1 rounded-[5px] border px-2.5 py-1 text-xs font-medium transition-colors ${
              userVote === 'yes'
                ? 'border-primary bg-accentMuted text-primary'
                : 'border-border bg-surface text-foregroundMuted hover:border-borderStrong hover:bg-surfaceMuted'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>Sí {helpfulCount > 0 ? helpfulCount : ''}</span>
          </button>
          <button
            type="button"
            onClick={handleVoteNo}
            className={`inline-flex items-center gap-1 rounded-[5px] border px-2.5 py-1 text-xs font-medium transition-colors ${
              userVote === 'no'
                ? 'border-borderStrong bg-surfaceStrong text-foreground'
                : 'border-border bg-surface text-foregroundMuted hover:border-borderStrong hover:bg-surfaceMuted'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2`}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>No</span>
          </button>
        </div>

        {userVote && (
          <span className="text-[11px] text-[#16A34A] animate-fade-in">
            ¡Gracias!
          </span>
        )}
      </div>
    </article>
  );
};
