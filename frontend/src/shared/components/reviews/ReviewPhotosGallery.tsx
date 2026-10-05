import * as React from 'react';
import { Camera, ChevronRight } from 'lucide-react';
import type { ReviewItem } from './review.types';

interface ReviewPhotosGalleryProps {
  reviews: ReviewItem[];
  onOpenPhoto: (review: ReviewItem, imageIndex: number) => void;
  totalPhotosCount?: number;
}

export const ReviewPhotosGallery: React.FC<ReviewPhotosGalleryProps> = ({
  reviews,
  onOpenPhoto,
  totalPhotosCount,
}) => {
  // Extract all photos with their associated review
  const photoItems = React.useMemo(() => {
    const items: { url: string; review: ReviewItem; imageIndex: number }[] = [];
    reviews.forEach((review) => {
      if (review.images && review.images.length > 0) {
        review.images.forEach((url, imgIdx) => {
          items.push({ url, review, imageIndex: imgIdx });
        });
      }
    });
    return items;
  }, [reviews]);

  if (photoItems.length === 0) return null;

  const countDisplay = totalPhotosCount ?? Math.max(photoItems.length, 32);
  const visiblePhotos = photoItems.slice(0, 4);
  const fifthPhoto = photoItems[4] || photoItems[0];
  const remainingCount = Math.max(1, countDisplay - 5);

  return (
    <div className="mt-4 rounded-[5px] border border-[#E5E7EB] bg-white p-3.5 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-bold text-[#111827] mb-3">
        <Camera className="h-4 w-4 text-[#111827]" />
        <span>Opiniones con fotos ({countDisplay})</span>
      </div>

      {/* Row of 5 thumbnails + right arrow */}
      <div className="relative flex items-center gap-2">
        <div className="grid grid-cols-5 gap-1.5 flex-1">
          {visiblePhotos.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenPhoto(item.review, item.imageIndex)}
              className="group relative aspect-square overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-[#F8FAFC] transition-transform hover:scale-102 hover:border-[#1D4ED8]"
            >
              <img
                src={item.url}
                alt={`Foto del comprador ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}

          {/* 5th thumbnail with overlay */}
          <button
            type="button"
            onClick={() => onOpenPhoto(fifthPhoto.review, fifthPhoto.imageIndex)}
            className="group relative aspect-square overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-[#F8FAFC] transition-transform hover:scale-102"
          >
            <img
              src={fifthPhoto.url}
              alt="Más fotos de compradores"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-bold text-white text-xs sm:text-sm">
              +{remainingCount}
            </div>
          </button>
        </div>

        {/* Advance arrow button */}
        <button
          type="button"
          onClick={() => onOpenPhoto(fifthPhoto.review, fifthPhoto.imageIndex)}
          aria-label="Ver más opiniones con fotos"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] shadow-2xs transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
