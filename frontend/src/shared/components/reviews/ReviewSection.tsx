import * as React from 'react';
import { ReviewSummary } from './ReviewSummary';
import { ReviewDistribution } from './ReviewDistribution';
import { ReviewPhotosGallery } from './ReviewPhotosGallery';
import { ReviewCard } from './ReviewCard';
import { ReviewImageViewer } from './ReviewImageViewer';
import type {
  ReviewItem,
  RatingDistributionItem,
  ReviewSortOption,
  ReviewSectionProps,
} from './review.types';

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  title = 'Opiniones del producto',
  rating,
  totalReviews,
  distribution: propDistribution,
  reviews,
  emptyMessage = 'No hay reseñas para mostrar.',
  className = '',
}) => {
  const [activeSort, setActiveSort] = React.useState<ReviewSortOption>('relevance');
  const [showAllReviews, setShowAllReviews] = React.useState(false);

  // Lightbox state
  const [lightbox, setLightbox] = React.useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    review: ReviewItem | null;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
    review: null,
  });

  // Calculate or use distribution
  const distribution: RatingDistributionItem[] = React.useMemo(() => {
    if (propDistribution && propDistribution.length > 0) {
      return propDistribution;
    }
    return [
      { rating: 5, count: 74, percent: 52 },
      { rating: 4, count: 38, percent: 27 },
      { rating: 3, count: 17, percent: 12 },
      { rating: 2, count: 9, percent: 6 },
      { rating: 1, count: 4, percent: 3 },
    ];
  }, [propDistribution]);

  // Sort reviews
  const sortedReviews = React.useMemo(() => {
    const items = [...reviews];
    switch (activeSort) {
      case 'relevance':
        return items.sort((a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));
      case 'recent':
        return items.reverse();
      case 'highest':
        return items.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return items.sort((a, b) => a.rating - b.rating);
      case 'with_photos':
        return items.sort((a, b) => {
          const aHas = a.images && a.images.length > 0 ? 1 : 0;
          const bHas = b.images && b.images.length > 0 ? 1 : 0;
          return bHas - aHas;
        });
      default:
        return items;
    }
  }, [reviews, activeSort]);

  // Display initial 3 reviews (matching reference) or all when expanded
  const displayedReviews = React.useMemo(() => {
    if (showAllReviews || sortedReviews.length <= 3) {
      return sortedReviews;
    }
    return sortedReviews.slice(0, 3);
  }, [sortedReviews, showAllReviews]);

  const handleOpenImage = (review: ReviewItem, imageIndex: number) => {
    if (!review.images || review.images.length === 0) return;
    setLightbox({
      isOpen: true,
      images: review.images,
      initialIndex: imageIndex,
      review,
    });
  };

  return (
    <section className={`w-full py-2 ${className}`}>
      {/* 2-Column Responsive Layout matching reference image */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Title, Rating, Distribution & Opiniones con fotos */}
        <aside className="lg:col-span-4 xl:col-span-4 flex flex-col">
          {/* Main Title */}
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-3">
            {title}
          </h3>

          {/* Average Rating & Stars */}
          <ReviewSummary rating={rating} totalReviews={totalReviews} />

          {/* Distribution Bars with counts (NO percentages) */}
          <div className="mt-4">
            <ReviewDistribution
              distribution={distribution}
              totalReviews={totalReviews}
            />
          </div>

          {/* Dedicated "Opiniones con fotos" gallery box */}
          <ReviewPhotosGallery
            reviews={reviews}
            onOpenPhoto={handleOpenImage}
            totalPhotosCount={32}
          />
        </aside>

        {/* Right Column: Sort dropdown & Reviews List */}
        <main className="lg:col-span-8 xl:col-span-8 flex flex-col">
          {/* Top Sort Control (NO star filter buttons) */}
          <div className="flex items-center justify-end pb-3">
            <div className="flex items-center gap-2 text-xs text-foregroundMuted">
              <span>Ordenar por:</span>
              <select
                aria-label="Ordenar reseñas"
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value as ReviewSortOption)}
                className="rounded-[5px] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-borderStrong focus:border-primary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 cursor-pointer shadow-2xs"
              >
                <option value="relevance">Más relevantes</option>
                <option value="recent">Más recientes</option>
                <option value="highest">Mejor valoradas</option>
                <option value="lowest">Peor valoradas</option>
                <option value="with_photos">Con fotos</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {displayedReviews.length > 0 ? (
              displayedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onOpenImage={handleOpenImage}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[5px] border border-dashed border-borderStrong bg-surfaceMuted p-8 text-center">
                <p className="text-xs sm:text-sm font-medium text-foregroundMuted">
                  {emptyMessage}
                </p>
              </div>
            )}
          </div>

          {/* "Ver todas las reseñas (142)" Action Button */}
          {totalReviews > 0 && (
            <div className="mt-6 flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllReviews((prev) => !prev)}
                className="w-full sm:w-auto min-w-[280px] rounded-[5px] border border-primary bg-surface px-6 py-2.5 text-center text-xs sm:text-sm font-semibold text-primary shadow-2xs transition-colors hover:bg-accentMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              >
                {showAllReviews
                  ? `Ver menos reseñas (${totalReviews})`
                  : `Ver todas las reseñas (${totalReviews})`}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Lightbox Modal for Customer Photos (White PrintShop Theme) */}
      <ReviewImageViewer
        isOpen={lightbox.isOpen}
        images={lightbox.images}
        initialIndex={lightbox.initialIndex}
        review={lightbox.review}
        onClose={() =>
          setLightbox((prev) => ({ ...prev, isOpen: false, review: null }))
        }
      />
    </section>
  );
};
