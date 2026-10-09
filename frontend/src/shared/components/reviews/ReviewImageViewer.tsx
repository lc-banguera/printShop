import * as React from 'react';
import { X, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Avatar } from '@/shared/ui/avatar';
import { ReviewRatingStars } from './ReviewRatingStars';
import type { ReviewItem } from './review.types';

interface ReviewImageViewerProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  review?: ReviewItem | null;
  onClose: () => void;
}

export const ReviewImageViewer: React.FC<ReviewImageViewerProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  review,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [helpfulCount, setHelpfulCount] = React.useState(review?.helpfulCount ?? 0);
  const [userVote, setUserVote] = React.useState<'yes' | 'no' | null>(null);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  React.useEffect(() => {
    setHelpfulCount(review?.helpfulCount ?? 0);
    setUserVote(null);
  }, [review]);

  const handlePrev = React.useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = React.useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

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

  const avatarFallback = review
    ? review.user.fallback ||
      review.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'US';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto del comprador"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-5 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-h-[92vh] w-full max-w-[500px] sm:max-w-[520px] overflow-hidden rounded-dialog border border-border bg-surface text-foreground shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching reference image: Title | Counter badge | Close button */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface">
          <span className="text-xs sm:text-sm font-bold text-foreground">
            Foto del comprador
          </span>

          <div className="flex items-center gap-3">
            {images.length > 1 && (
              <span className="rounded-[4px] bg-surfaceStrong px-2 py-0.5 text-xs font-medium text-foregroundMuted">
                {currentIndex + 1} de {images.length}
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar visor"
              className="flex h-6 w-6 items-center justify-center rounded-[4px] text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable container for image and review details */}
        <div className="overflow-y-auto max-h-[calc(92vh-50px)]">
          {/* Main Large Image Presentation */}
          <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surfaceMuted">
            <img
              src={currentImage}
              alt="Foto del comprador en tamaño grande"
              className="h-full w-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-md transition-colors hover:bg-accentMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-md transition-colors hover:bg-accentMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip (if multiple images) */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 border-b border-borderMuted bg-surface px-4 py-2.5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[5px] border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-primary'
                      : 'border-border opacity-70 hover:opacity-100'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Review Details Info */}
          {review && (
            <div className="p-4 sm:p-5 bg-surface">
              {/* User Header */}
              <div className="flex items-center gap-3">
                <Avatar
                  src={review.user.avatar}
                  alt={review.user.name}
                  fallback={avatarFallback}
                  className="h-9 w-9 rounded-full border border-border bg-surfaceStrong text-xs font-bold text-foreground"
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

              {/* Title */}
              {review.title && (
                <h5 className="mt-3 text-xs sm:text-sm font-bold text-foreground">
                  {review.title}
                </h5>
              )}

              {/* Comment */}
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-foregroundMuted">
                {review.comment}
              </p>

              {/* Helpful feedback controls (NO verified purchase text) */}
              <div className="mt-4 flex items-center gap-3 text-xs text-foregroundMuted">
                <span>¿Te resultó útil?</span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
