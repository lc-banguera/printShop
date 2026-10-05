import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/features/landing/data/products.data";

interface ProductGalleryProps {
  product: Product;
  relatedThumbnails?: string[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ product, relatedThumbnails = [] }) => {
  // Build a curated list of images for this product (main image first + real thumbnails)
  const images = React.useMemo(() => {
    const list = (product.images?.length ? product.images.map((image) => image.url) : [product.image]).filter(Boolean);
    for (const thumb of relatedThumbnails) {
      if (thumb && !list.includes(thumb) && list.length < 5) {
        list.push(thumb);
      }
    }
    return list;
  }, [product.image, relatedThumbnails]);

  const [activeIdx, setActiveIdx] = React.useState(0);

  // Reset active index when product changes
  React.useEffect(() => {
    setActiveIdx(0);
  }, [product.id]);

  const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[560px] flex-col gap-4 lg:max-w-none">
      {/* Main product image */}
      <div className="relative flex max-h-[520px] aspect-[5/4] w-full items-center justify-center overflow-hidden rounded-card border border-border bg-surfaceMuted shadow-subtle sm:aspect-[4/3] lg:aspect-[5/4]">
        <img
          src={images[activeIdx] || product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 sm:p-6 transition-all duration-200"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-control border border-border bg-surface text-foregroundMuted shadow-subtle transition-colors hover:bg-surfaceMuted hover:text-foreground"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-control border border-border bg-surface text-foregroundMuted shadow-subtle transition-colors hover:bg-surfaceMuted hover:text-foreground"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto py-1">
          {images.map((src, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-control border-2 bg-surfaceMuted transition-all ${
                  isActive ? "border-primary shadow-subtle" : "border-border hover:border-borderStrong"
                }`}
                aria-label={`Miniatura ${idx + 1}`}
              >
                <img
                  src={src}
                  alt={`${product.name} miniatura ${idx + 1}`}
                  className="w-full h-full object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
