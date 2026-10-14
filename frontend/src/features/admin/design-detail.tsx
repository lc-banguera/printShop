import React from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Headphones,
  Package,
  ShieldCheck,
  ShoppingCart,
  Star,
  Check,
} from 'lucide-react';
import { StatusBadge } from '@/shared/ui/status-badge';
import { mockDesigns, type AdminDesign } from './data';
import { ReviewSection, type ReviewItem } from '@/shared/components/reviews';
import { useCartStore } from '@/features/cart';

type TabKey = 'descripcion' | 'adicional' | 'resenas';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${
            index < Math.round(rating)
              ? 'fill-[var(--warning)] text-[var(--warning)]'
              : 'text-[var(--border-strong)]'
          }`}
        />
      ))}
    </div>
  );
}

function DesignGallery({ design }: { design: AdminDesign }) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [design.id]);

  const prev = () => {
    setActiveIndex((current) =>
      current === 0 ? design.images.length - 1 : current - 1
    );
  };

  const next = () => {
    setActiveIndex((current) =>
      current === design.images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="relative flex aspect-[5/4] max-h-[380px] w-full items-center justify-center overflow-hidden rounded-[5px] border border-[var(--border)] bg-[var(--surface-muted)]">
        <img
          src={design.images[activeIndex] || design.image}
          alt={design.name}
          className="h-full w-full object-contain p-4 sm:p-6 transition-all duration-200"
        />

        {design.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center border border-[var(--border)] bg-white text-[var(--text-secondary)] shadow-2xs transition-colors hover:bg-[var(--surface-muted)]"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center border border-[var(--border)] bg-white text-[var(--text-secondary)] shadow-2xs transition-colors hover:bg-[var(--surface-muted)]"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {design.images.map((src, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={`${design.id}-${src}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-[4px] border-2 bg-[var(--surface-muted)] transition-all sm:h-14 sm:w-14 ${
                isActive
                  ? 'border-[var(--primary-hover)] shadow-2xs'
                  : 'border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
              aria-label={`Miniatura ${index + 1}`}
            >
              <img
                src={src}
                alt={`${design.name} miniatura ${index + 1}`}
                className="h-full w-full object-contain p-1"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DesignInfo({ design }: { design: AdminDesign }) {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [addedSuccess, setAddedSuccess] = React.useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  React.useEffect(() => {
    setIsFavorite(false);
    setAddedSuccess(false);
  }, [design.id]);

  const handleAddToCart = () => {
    const numericPrice =
      parseInt(design.price.replace(/[^0-9]/g, ''), 10) || 39900;
    const originalNumericPrice = design.originalPrice
      ? parseInt(design.originalPrice.replace(/[^0-9]/g, ''), 10)
      : undefined;

    addItem({
      itemType: 'design',
      itemId: design.id,
      productId: design.id,
      designId: design.id,
      name: design.name,
      description: design.description,
      price: numericPrice,
      originalPrice: originalNumericPrice,
      image: design.images?.[0] || design.image,
      category: 'Diseño',
      author: design.author,
      format: design.format,
      license: design.license,
      quantity: 1,
      inStock: true,
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="flex w-full flex-col gap-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] sm:text-xs">
        {design.category}
      </span>

      <h1 className="text-xl font-bold leading-tight text-[var(--text-primary)] sm:text-2xl">
        {design.name}
      </h1>

      <div className="text-xs text-[var(--text-secondary)] sm:text-sm">
        Diseño creado por:{' '}
        <span className="font-semibold text-[var(--text-primary)]">{design.author}</span>
      </div>

      <p className="text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
        {design.description}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <RatingStars rating={design.rating} />
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          {design.rating.toFixed(1)} / 5.0
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          ({design.reviewsCount} reseñas)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xl font-extrabold text-[var(--text-primary)] sm:text-2xl">
          {design.price}
        </span>
        {design.originalPrice && (
          <span className="text-xs text-[var(--text-muted)] line-through sm:text-sm">
            {design.originalPrice}
          </span>
        )}
        {design.discount && (
          <span className="text-xs font-semibold text-[var(--primary-hover)]">
            {design.discount}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
        <StatusBadge status={design.status} />
        <span className="text-[var(--border-strong)]">•</span>
        <span>{design.format}</span>
        <span className="text-[var(--border-strong)]">•</span>
        <span>{design.license}</span>
      </div>

      {/* ── Botones de Compra (existentes) ────────────────────────────── */}
      <div className="flex w-full flex-col items-center gap-2.5 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={handleBuyNow}
          className="flex h-10 w-full flex-1 items-center justify-center gap-2 rounded-[5px] bg-[var(--primary-hover)] px-4 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--primary-hover)] cursor-pointer sm:text-sm"
        >
          <span>Comprar ahora</span>
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex h-10 w-full flex-1 items-center justify-center gap-2 rounded-[5px] border-2 font-semibold text-xs transition-colors cursor-pointer sm:text-sm ${
            addedSuccess
              ? 'bg-[var(--success)] border-[var(--success)] text-white'
              : 'border-[var(--primary-hover)] bg-white text-[var(--primary-hover)] hover:bg-[var(--info-muted)]'
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>¡Diseño agregado al carrito!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Agregar al carrito</span>
            </>
          )}
        </button>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsFavorite((current) => !current)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
            isFavorite ? 'text-[var(--danger-strong)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary-hover)]'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          <span>{isFavorite ? 'En tus favoritos' : 'Agregar a favoritos'}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-[var(--border-muted)] pt-3.5">
        <div className="flex items-start gap-2.5">
          <Package className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary-hover)]" />
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Entrega digital</p>
            <p className="text-[11px] text-[var(--text-secondary)]">Archivo disponible tras la compra</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary-hover)]" />
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Pagos seguros</p>
            <p className="text-[11px] text-[var(--text-secondary)]">Tus pagos 100% protegidos</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary-hover)]" />
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Atención 24/7</p>
            <p className="text-[11px] text-[var(--text-secondary)]">Soporte para compras de diseños</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesignTabs({ design }: { design: AdminDesign }) {
  const [activeTab, setActiveTab] = React.useState<TabKey>('adicional');

  React.useEffect(() => {
    setActiveTab('adicional');
  }, [design.id]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'descripcion', label: 'Descripción' },
    { key: 'adicional', label: 'Información adicional' },
    { key: 'resenas', label: `Reseñas (${design.reviewsCount})` },
  ];

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count:
      rating === 5
        ? Math.round(design.reviewsCount * 0.68)
        : rating === 4
        ? Math.round(design.reviewsCount * 0.22)
        : rating === 3
        ? Math.round(design.reviewsCount * 0.07)
        : rating === 2
        ? Math.round(design.reviewsCount * 0.02)
        : Math.round(design.reviewsCount * 0.01),
    percent: rating === 5 ? 68 : rating === 4 ? 22 : rating === 3 ? 7 : rating === 2 ? 2 : 1,
  }));

  const formattedReviews: ReviewItem[] = React.useMemo(() => {
    return design.reviews.map((r, idx) => ({
      id: r.id || `des-rev-${idx}`,
      user: {
        name: r.user,
        fallback: r.user.slice(0, 2).toUpperCase(),
      },
      rating: r.rating,
      date: r.date,
      verifiedPurchase: r.verifiedPurchase ?? true,
      title: r.title,
      comment: r.comment,
      images: r.images,
      helpfulCount: r.helpfulCount ?? 12 - idx * 2,
    }));
  }, [design.reviews]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-6 overflow-x-auto border-b border-[var(--border)] pb-0 sm:gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative whitespace-nowrap py-2 text-xs font-semibold transition-all sm:text-sm ${
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 -mb-[1px] h-0.5 bg-[var(--primary-hover)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        {activeTab === 'descripcion' && (
          <div className="max-w-3xl space-y-3 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
            <p>
              <strong>{design.name}</strong> pertenece a la categoría {design.category} y fue creado por {design.author}. Está preparado para compra digital y uso bajo la licencia indicada por el diseñador.
            </p>
            <p>
              El archivo se entrega con proporciones optimizadas para productos personalizables, manteniendo nitidez, contraste y legibilidad en producción.
            </p>
          </div>
        )}

        {activeTab === 'adicional' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[var(--primary)] text-white">
                  <th className="w-1/3 px-4 py-2.5 font-semibold text-white">Característica</th>
                  <th className="w-2/3 px-4 py-2.5 font-semibold text-white">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {design.specs.map((row, index) => (
                  <tr
                    key={row.characteristic}
                    className={`border-b border-[var(--border-muted)] transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[var(--surface-muted)]'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-bold text-[var(--text-primary)]">
                      {row.characteristic}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-secondary)]">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'resenas' && (
          <ReviewSection
            rating={design.rating}
            totalReviews={design.reviewsCount}
            distribution={ratingDistribution}
            reviews={formattedReviews}
            emptyMessage="No se encontraron reseñas para este diseño con el filtro seleccionado."
          />
        )}
      </div>
    </div>
  );
}

function SimilarDesigns({ design }: { design: AdminDesign }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const relatedDesigns = React.useMemo(
    () => mockDesigns.filter((item) => item.id !== design.id),
    [design.id]
  );

  React.useEffect(() => {
    setIsExpanded(false);
  }, [design.id]);

  const visibleDesigns = isExpanded ? relatedDesigns : relatedDesigns.slice(0, 6);

  return (
    <section className="w-full">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[var(--text-primary)] sm:text-lg">
          Diseños similares
        </h2>
        {relatedDesigns.length > 6 && (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="text-xs font-semibold text-[var(--primary-hover)] transition-colors hover:text-[var(--primary-hover)]"
          >
            {isExpanded ? 'Ver menos diseños ←' : 'Ver todos los diseños →'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 transition-all sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {visibleDesigns.map((item) => (
          <Link
            key={item.id}
            to={`/admin/designs/${item.id}`}
            className="group flex flex-col overflow-hidden rounded-[5px] border border-[var(--border)] bg-white transition-all duration-200 hover:border-[var(--border-strong)]"
          >
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-[var(--surface-muted)] p-2.5 sm:p-3">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
              <h3 className="line-clamp-1 text-xs font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--primary-hover)] sm:text-sm">
                {item.name}
              </h3>
              <p className="line-clamp-1 text-[11px] text-[var(--text-secondary)]">{item.author}</p>
              <p className="text-[11px] font-medium text-[var(--text-secondary)]">{item.category}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-[var(--warning)] text-[var(--warning)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">{item.rating.toFixed(1)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs font-extrabold text-[var(--text-primary)]">{item.price}</span>
                {item.colors.slice(0, 3).map((color) => (
                  <span
                    key={color}
                    className="h-2.5 w-2.5 rounded-full border border-[var(--border-strong)] shadow-2xs"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DesignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const design = React.useMemo(
    () => mockDesigns.find((item) => item.id === id),
    [id]
  );

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!design) {
    return <Navigate to="/admin/designs" replace />;
  }

  return (
    <div className="min-h-full bg-[var(--surface-muted)] p-4">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--border-strong)]">
          <span>Admin</span>
          <ChevronRight className="h-3 w-3 text-[var(--border-strong)]" />
          <button
            type="button"
            onClick={() => navigate('/admin/designs')}
            className="font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
          >
            Diseños
          </button>
          <ChevronRight className="h-3 w-3 text-[var(--border-strong)]" />
          <span className="font-bold text-[var(--text-primary)]">{design.name}</span>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 rounded-[5px] border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-5 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <DesignGallery design={design} />
          </div>
          <div className="lg:col-span-6">
            <DesignInfo design={design} />
          </div>
        </div>

        <div className="rounded-[5px] border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-5">
          <DesignTabs design={design} />
        </div>

        <div className="rounded-[5px] border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-5">
          <SimilarDesigns design={design} />
        </div>
      </div>
    </div>
  );
}
