import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/features/landing/data/products.data";
import { ProductCard } from "@/features/landing/components/Products/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  allProducts: Product[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProductId,
  allProducts,
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Filter out the current product from related products
  const relatedList = React.useMemo(() => {
    return allProducts.filter((p) => p.id !== currentProductId);
  }, [allProducts, currentProductId]);

  // Initial visible 6 products, or all when expanded
  const initialCount = 6;
  const initialItems = relatedList.slice(0, initialCount);
  const additionalItems = relatedList.slice(initialCount, 18); // Show up to 18 when expanded

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 260;
    scrollContainerRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
          Productos relacionados
        </h2>

        <div className="flex items-center gap-3">
          {/* THE ONLY EXPAND/COLLAPSE CONTROL */}
          {relatedList.length > initialCount && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors cursor-pointer"
            >
              {isExpanded ? "Ver menos productos" : "Ver todos los productos"}
            </button>
          )}
        </div>
      </div>

      {/* Initial 6 Items Grid */}
      <div
        ref={scrollContainerRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3"
      >
        {initialItems.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Additional Items Expanded with Smooth Fade-in & Translate Animation */}
      {isExpanded && additionalItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
          {additionalItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
