import * as React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  ArrowRight,
  Check,
  Search,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Header } from "@/features/landing/components/Header";
import { Footer } from "@/features/landing/components/Footer";
import { Container } from "@/shared/components/Container/Container";
import { useAuthStore } from "@/features/auth";
import { useFavoritesStore } from "./favorites-store";
import { useCartStore } from "@/features/cart";
import {
  Product,
  getCategoryDisplayName,
  getAvailabilityConfig,
} from "@/features/landing/data/products.data";

interface FavoriteItemRowProps {
  product: Product;
  userId: string;
  onRemove: (productId: string) => void;
}

const FavoriteItemRow: React.FC<FavoriteItemRowProps> = ({
  product,
  userId,
  onRemove,
}) => {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdded, setIsAdded] = React.useState(false);

  const hasColors = Boolean(product.colors && product.colors.length > 0);
  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);

  const [selectedColor, setSelectedColor] = React.useState<string>(
    hasColors ? product.colors[0] : ""
  );
  const [selectedSize, setSelectedSize] = React.useState<string>(
    hasSizes ? product.sizes![0] : "M"
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const numericPrice =
      parseInt(product.price.replace(/[^0-9]/g, ""), 10) || 49900;

    addItem({
      productId: product.id,
      name: product.name,
      description: product.description,
      price: numericPrice,
      image: product.image,
      color: selectedColor || undefined,
      size: hasSizes ? selectedSize : "Única",
      category: getCategoryDisplayName(product.category),
      quantity: 1,
      inStock: product.availability !== "Agotado",
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product.id);
  };

  const availability = getAvailabilityConfig(product.availability);

  return (
    <div className="flex min-w-0 flex-col items-start justify-between gap-5 rounded-card border border-border bg-surface p-4 shadow-subtle transition-all duration-normal hover:border-borderStrong hover:shadow-card sm:p-6 lg:flex-row lg:items-center">
      {/* ── 1. BLOQUE IZQUIERDO: IMAGEN + INFORMACIÓN ───────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0 w-full lg:w-auto">
        {/* Imagen del producto */}
        <Link
          to={product.href || `/products/${product.id}`}
          className="flex h-32 w-32 shrink-0 items-center justify-center rounded-card border border-border bg-surfaceMuted p-3 sm:h-40 sm:w-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Información del producto */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-secondary)]">
            {getCategoryDisplayName(product.category)}
          </span>

          <h2 className="mt-0.5 line-clamp-1 text-base font-bold text-foreground transition-colors hover:text-primary sm:text-lg">
            <Link
              to={product.href || `/products/${product.id}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {product.name}
            </Link>
          </h2>

          <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
            {product.description}
          </p>

          <div className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mt-2 sm:mt-2.5">
            {product.price}
          </div>

          {/* Disponibilidad (Únicamente: Disponible | Pocas unidades | Agotado) */}
          <div className="mt-1.5 flex items-center">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${availability.textColor}`}
            >
              <span className={`h-2 w-2 rounded-full ${availability.dotColor}`} />
              {availability.label}
            </span>
          </div>

          {/* Fecha de agregado */}
          <span className="text-[11px] text-[var(--text-muted)] mt-2">
            Agregado el 3 de septiembre de 2026
          </span>
        </div>
      </div>

      {/* ── 2. BLOQUE CENTRAL: VARIANTES (COLOR / TALLA) ─────────────── */}
      <div className="flex w-full min-w-0 shrink-0 flex-col gap-3 border-t border-borderMuted pt-4 sm:w-auto lg:border-t-0 lg:pt-0">
        {/* Selector de Color */}
        {hasColors && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] w-12 shrink-0">
              Color:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {product.colors.map((colorHex) => {
                const isSelected = selectedColor === colorHex;
                return (
                  <button
                    key={colorHex}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(colorHex);
                    }}
                    className={`w-5 h-5 rounded-full border border-[var(--border-strong)] transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 shadow-xs"
                        : "hover:scale-105 opacity-85 hover:opacity-100"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                    style={{ backgroundColor: colorHex }}
                    title={colorHex}
                    aria-label={`Color ${colorHex}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Selector de Talla */}
        {hasSizes && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] w-12 shrink-0">
              Talla:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.sizes!.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`h-7 min-w-[30px] px-2 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primaryForeground shadow-subtle"
                        : "border border-border bg-surface text-foregroundMuted hover:bg-infoMuted hover:text-primary"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. BLOQUE DERECHO: ACCIONES ──────────────────────────────── */}
      <div className="flex w-full shrink-0 flex-row gap-2.5 border-t border-borderMuted pt-4 sm:w-48 sm:flex-col lg:border-t-0 lg:pt-0">
        {/* Botón Principal: Agregar al carrito */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 sm:flex-none h-10 px-4 rounded-[5px] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
            isAdded
              ? "bg-success text-primaryForeground"
              : "bg-primary text-primaryForeground hover:bg-primaryHover active:scale-[0.99]"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4" />
              <span>¡Agregado al carrito!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Agregar al carrito</span>
            </>
          )}
        </button>

        {/* Botón Secundario: Eliminar */}
        <button
          type="button"
          onClick={handleRemove}
          className="flex-1 sm:flex-none h-10 px-4 rounded-[5px] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-[var(--border)] hover:border-[var(--danger-strong)] text-[var(--danger-strong)] hover:bg-[var(--danger-muted)] bg-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Heart className="h-4 w-4" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
};

export const FavoritesPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { getUserFavoriteProducts, removeFavorite } = useFavoritesStore();

  const [activeTab, setActiveTab] = React.useState<"todos" | "disponibles">(
    "todos"
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState<
    "recientes" | "precio-asc" | "precio-desc" | "nombre-asc"
  >("recientes");

  const userId = user?.id || "usr-client-01";
  const rawFavoriteProducts = isAuthenticated
    ? getUserFavoriteProducts(userId)
    : [];

  const handleRemoveProduct = (productId: string) => {
    if (userId) {
      removeFavorite(productId, userId);
    }
  };

  const handleClearAll = () => {
    if (userId && rawFavoriteProducts.length > 0) {
      rawFavoriteProducts.forEach((p) => removeFavorite(p.id, userId));
    }
  };

  // Contadores para tabs
  const totalCount = rawFavoriteProducts.length;
  const availableCount = rawFavoriteProducts.filter(
    (p) => p.availability !== "Agotado"
  ).length;

  // Filtrado y Ordenamiento
  const filteredProducts = React.useMemo(() => {
    let list = [...rawFavoriteProducts];

    // Filtro por tab
    if (activeTab === "disponibles") {
      list = list.filter((p) => p.availability !== "Agotado");
    }

    // Filtro por buscador
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Ordenamiento
    if (sortBy === "precio-asc") {
      list.sort((a, b) => {
        const pA = parseInt(a.price.replace(/[^0-9]/g, ""), 10) || 0;
        const pB = parseInt(b.price.replace(/[^0-9]/g, ""), 10) || 0;
        return pA - pB;
      });
    } else if (sortBy === "precio-desc") {
      list.sort((a, b) => {
        const pA = parseInt(a.price.replace(/[^0-9]/g, ""), 10) || 0;
        const pB = parseInt(b.price.replace(/[^0-9]/g, ""), 10) || 0;
        return pB - pA;
      });
    } else if (sortBy === "nombre-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [rawFavoriteProducts, activeTab, searchTerm, sortBy]);

  return (
    <div className="min-h-screen flex min-w-0 flex-col bg-background">
      {/* ── Header actual de PrintShop ────────────────────────────── */}
      <Header />

      {/* ── Contenido Principal ───────────────────────────────────── */}
      <main className="min-w-0 flex-1 py-8 sm:py-10">
        <Container variant="wide" className="space-y-7">
          {/* ── Encabezado y Breadcrumb ─────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
              <Link to="/" className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Inicio
              </Link>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-medium">Favoritos</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Mis Favoritos
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Aquí encontrarás todos los productos que has guardado para comprar más adelante.
                </p>
              </div>

              {/* Botón Vaciar favoritos en la cabecera */}
              {isAuthenticated && rawFavoriteProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--danger-strong)] hover:text-[var(--danger-strong)] border border-[var(--border)] hover:border-[var(--danger-muted)] hover:bg-[var(--danger-muted)] px-3 py-2 rounded-[5px] transition-colors cursor-pointer self-start sm:self-auto bg-white shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Vaciar favoritos</span>
                </button>
              )}
            </div>

            {/* Línea divisoria horizontal */}
            <div className="border-b border-[var(--border)]" />
          </div>

          {/* ── Estado 1: Usuario no autenticado ────────────────────── */}
          {!isAuthenticated ? (
            <div className="bg-white rounded-[6px] border border-[var(--border)] p-10 sm:p-16 flex flex-col items-center text-center shadow-2xs max-w-xl mx-auto my-8">
      
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                Inicia sesión para ver tus favoritos
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 max-w-md leading-relaxed">
                Tus productos guardados se sincronizan automáticamente con tu cuenta de PrintShop para que puedas consultarlos desde cualquier dispositivo.
              </p>
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-6 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Iniciar sesión</span>

              </button>
            </div>
          ) : rawFavoriteProducts.length === 0 ? (
            /* ── Estado 2: Lista vacía ──────────────────────────────── */
            <div className="bg-white rounded-[6px] border border-[var(--border)] p-10 sm:p-16 flex flex-col items-center text-center shadow-2xs max-w-xl mx-auto my-8">
              <div className="h-16 w-16 rounded-full bg-[var(--border-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                Aún no tienes productos favoritos
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 max-w-md leading-relaxed">
                Explora nuestro catálogo y guarda los productos que más te gusten para comprarlos después.
              </p>
              <Link
                to="/"
                className="flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-6 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Explorar productos</span>
              </Link>
            </div>
          ) : (
            /* ── Estado 3: Lista de Favoritos (Estructura Horizontal) ─ */
            <div className="space-y-5">
              {/* ── Controles Superiores: Tabs + Buscador + Orden ─────── */}
              <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-borderMuted md:border-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("todos")}
                    className={`text-xs sm:text-sm pb-2.5 font-semibold transition-all relative cursor-pointer ${
                      activeTab === "todos"
                        ? "text-primary"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    <span>Todos ({totalCount})</span>
                    {activeTab === "todos" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("disponibles")}
                    className={`text-xs sm:text-sm pb-2.5 font-semibold transition-all relative cursor-pointer ${
                      activeTab === "disponibles"
                        ? "text-primary"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    <span>Disponibles ({availableCount})</span>
                    {activeTab === "disponibles" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                </div>

                {/* Buscador y Ordenar por */}
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  {/* Buscador */}
                  <div className="relative min-w-0 flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Buscar en mis favoritos"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 w-full rounded-control border border-border bg-surface pl-9 pr-3 text-xs text-foreground shadow-subtle outline-none transition-all placeholder:text-foregroundSubtle focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  {/* Ordenar por */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap hidden sm:inline">
                      Ordenar por:
                    </span>
                    <div className="relative flex-1 sm:flex-none">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-10 w-full appearance-none rounded-control border border-border bg-surface pl-3 pr-8 text-xs font-medium text-foreground shadow-subtle outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
                      >
                        <option value="recientes">
                          Agregados más recientemente
                        </option>
                        <option value="precio-asc">
                          Precio: menor a mayor
                        </option>
                        <option value="precio-desc">
                          Precio: mayor a menor
                        </option>
                        <option value="nombre-asc">Nombre: A-Z</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Lista Vertical de Filas Horizontales ──────────────── */}
              {filteredProducts.length === 0 ? (
                <div className="rounded-card border border-border bg-surface p-8 text-center text-xs text-foregroundMuted shadow-subtle sm:text-sm">
                  No se encontraron productos favoritos con los filtros seleccionados.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredProducts.map((product) => (
                    <FavoriteItemRow
                      key={product.id}
                      product={product}
                      userId={userId}
                      onRemove={handleRemoveProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Container>
      </main>

      {/* ── Footer actual de PrintShop ────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default FavoritesPage;
