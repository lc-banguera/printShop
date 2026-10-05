import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../data/products.data';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // ── Actualizar visibilidad de botones según la posición del scroll ──
  const updateScrollButtons = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons, { passive: true });
    }
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateScrollButtons);
      }
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, products]);

  // ── Desplazamiento suave por bloque de productos visibles ───────────
  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth;
    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full min-w-0">
      {/* ── Flecha Circular Izquierda (aparece al avanzar) ──────────── */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Ver productos anteriores"
          className="absolute -left-3 top-[34%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-subtle transition-all hover:bg-surfaceMuted hover:shadow-card active:scale-95 sm:-left-4 md:-left-5"
        >
          <ChevronLeft className="h-5 w-5 text-primary" strokeWidth={2.5} />
        </button>
      )}

      {/* ── Track Horizontal del Carrusel (sin scrollbar visible) ───── */}
      <div
        ref={scrollContainerRef}
        className="flex w-full min-w-0 select-none gap-3.5 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-card
            className="w-[calc((100%-14px)/2)] shrink-0 sm:w-[calc((100%-2*16px)/3)] md:w-[calc((100%-3*16px)/4)] lg:w-[calc((100%-4*16px)/5)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* ── Flecha Circular Derecha (estilo de la referencia visual) ─── */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Ver siguientes productos"
          className="absolute -right-3 top-[34%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-subtle transition-all hover:bg-surfaceMuted hover:shadow-card active:scale-95 sm:-right-4 md:-right-5"
        >
          <ChevronRight className="h-5 w-5 text-primary" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default ProductGrid;
