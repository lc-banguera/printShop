import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Download,
  Plus,
  Filter,
  Search,
  ChevronDown,
  Store,
  Heart,
  MoreVertical,
  Eye,
  ExternalLink,
  Paintbrush,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown";

/* ── Tipos ─────────────────────────────────────────────────────── */
interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  store: string;
  category: string;
  availability: "Disponible" | "Pocas unidades" | "Agotado";
  status: "Activo" | "Pendiente" | "Deshabilitado";
  image: string;
}

/* ── Datos Mock Reales según la Referencia Oficial ────────────── */
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Hoodie Clásico Unisex",
    sku: "HOD-CLS-002",
    price: "$200.000",
    store: "Urban Style Prints",
    category: "Hoodies",
    availability: "Disponible",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Camiseta Oversize Premium",
    sku: "CAM-OVR-001",
    price: "$200.000",
    store: "Creative Print Store",
    category: "Camisetas",
    availability: "Disponible",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Taza Personalizada",
    sku: "TAZ-PER-003",
    price: "$45.000",
    store: "Print House CO",
    category: "Tazas",
    availability: "Pocas unidades",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Póster Premium A3",
    sku: "POS-A3-005",
    price: "$30.900",
    store: "Creative Print Store",
    category: "Pósters",
    availability: "Disponible",
    status: "Activo",
    image: "",
  },
  {
    id: "5",
    name: "Gorra Bordada",
    sku: "GOR-BRD-004",
    price: "$80.000",
    store: "Color Express",
    category: "Accesorios",
    availability: "Pocas unidades",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    name: "Bolsa Ecológica Print",
    sku: "BOL-ECO-006",
    price: "$25.000",
    store: "Urban Style Prints",
    category: "Accesorios",
    availability: "Disponible",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "7",
    name: "Sticker Pack",
    sku: "STK-PCK-008",
    price: "$15.000",
    store: "Urban Style Prints",
    category: "Stickers",
    availability: "Disponible",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "8",
    name: "Case Personalizado",
    sku: "CAS-PER-009",
    price: "$35.000",
    store: "Print House CO",
    category: "Accesorios",
    availability: "Pocas unidades",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "9",
    name: "Botella Térmica",
    sku: "BOT-TER-010",
    price: "$65.000",
    store: "Color Express",
    category: "Accesorios",
    availability: "Disponible",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "10",
    name: "Cuadro Decorativo",
    sku: "CUA-DEC-011",
    price: "$120.000",
    store: "Print House CO",
    category: "Decoración",
    availability: "Disponible",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
  },
];

/* ── Sub-Componente: Imagen del Producto Limpia y Proporcional ─── */
function ProductCardImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = React.useState(false);

  return error || !src ? (
    <div
      className="h-full w-full bg-[var(--surface-muted)] flex flex-col items-center justify-center text-[var(--text-muted)]"
      title={alt}
    >
      <Package className="h-9 w-9 text-[var(--border-strong)]" />
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setError(true)}
    />
  );
}

const PAGE_SIZE = 10;

/* ── Componente Principal ──────────────────────────────────────── */
export default function Products() {
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ sidebarCollapsed?: boolean }>();
  const isSidebarCollapsed = outletContext?.sidebarCollapsed ?? false;

  const [products] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [storeFilter, setStoreFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [availabilityFilter, setAvailabilityFilter] = useState("Todas");
  const [sortBy, setSortBy] = useState("Más recientes");
  const [currentPage, setCurrentPage] = useState(1);

  // Favoritos locales
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Notificaciones
  const [notice, setNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState(false);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2200);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    showNotice(
      !favorites[id] ? "Guardado en favoritos" : "Eliminado de favoritos",
    );
  };

  // Filtrado
  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.store.toLowerCase().includes(term);

    const matchCategory =
      categoryFilter === "Todas" || p.category === categoryFilter;
    const matchStore = storeFilter === "Todas" || p.store === storeFilter;
    const matchStatus = statusFilter === "Todos" || p.status === statusFilter;
    const matchAvailability =
      availabilityFilter === "Todas" || p.availability === availabilityFilter;

    return (
      matchSearch &&
      matchCategory &&
      matchStore &&
      matchStatus &&
      matchAvailability
    );
  });

  const paginatedProducts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Listas para los filtros
  const categoriesList = Array.from(new Set(products.map((p) => p.category)));
  const storesList = Array.from(new Set(products.map((p) => p.store)));

  /*
   * ── Responsive Grid Columns ──────────────────────────────────────
   * Cuando el sidebar está visible: 4 a 5 tarjetas por fila según ancho.
   * Cuando el sidebar está oculto: 5 a 6 tarjetas por fila.
   */
  const gridColsClass = isSidebarCollapsed
    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5"
    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5";

  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-4 bg-[var(--background)] min-h-full">
      {/* ── Encabezado Principal ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold text-[var(--text-primary)] leading-tight tracking-tight">
            Productos
          </h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
            Explora, administra y consulta todos los productos de las tiendas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setExportNotice(true);
              setTimeout(() => setExportNotice(false), 2000);
            }}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-[5px] px-3.5 py-1.5 bg-white hover:bg-[var(--surface-muted)] transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span>{exportNotice ? "Exportando..." : "Exportar"}</span>
          </button>
          <button
            type="button"
            onClick={() => showNotice("Formulario de nuevo producto")}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-white bg-[var(--primary)] rounded-[5px] px-3.5 py-1.5 hover:bg-[var(--primary-hover)] transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo producto</span>
          </button>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros ────────────────────────── */}
      <div className="bg-white rounded-[5px] border border-[var(--border)] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 min-w-[220px] max-w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar producto, SKU o tienda..."
            className="w-full h-8 pl-8 pr-3 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-white border border-[var(--border)] rounded-[5px] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
          />
        </div>

        {/* Selectores de Filtro según la Referencia */}
        <div className="flex flex-wrap items-end gap-2.5">
          {/* Categoría */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)] font-normal leading-none mb-1">
              Categoría
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 rounded-[5px] border border-[var(--border)] bg-white pl-2.5 pr-6 text-[11.5px] font-normal text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
              >
                <option value="Todas">Todas</option>
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-[var(--text-secondary)]" />
            </div>
          </div>

          {/* Tienda */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)] font-normal leading-none mb-1">
              Tienda
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={storeFilter}
                onChange={(e) => {
                  setStoreFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 rounded-[5px] border border-[var(--border)] bg-white pl-2.5 pr-6 text-[11.5px] font-normal text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
              >
                <option value="Todas">Todas</option>
                {storesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-[var(--text-secondary)]" />
            </div>
          </div>

          {/* Estado */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)] font-normal leading-none mb-1">
              Estado
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 rounded-[5px] border border-[var(--border)] bg-white pl-2.5 pr-6 text-[11.5px] font-normal text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
              >
                <option value="Todos">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Deshabilitado">Deshabilitado</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-[var(--text-secondary)]" />
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)] font-normal leading-none mb-1">
              Disponibilidad
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={availabilityFilter}
                onChange={(e) => {
                  setAvailabilityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 rounded-[5px] border border-[var(--border)] bg-white pl-2.5 pr-6 text-[11.5px] font-normal text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
              >
                <option value="Todas">Todas</option>
                <option value="Disponible">Disponible</option>
                <option value="Pocas unidades">Pocas unidades</option>
                <option value="Agotado">Agotado</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-[var(--text-secondary)]" />
            </div>
          </div>

          {/* Ordenar por */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)] font-normal leading-none mb-1">
              Ordenar por
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 rounded-[5px] border border-[var(--border)] bg-white pl-2.5 pr-6 text-[11.5px] font-normal text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
              >
                <option value="Más recientes">Más recientes</option>
                <option value="Precio: menor a mayor">
                  Precio: menor a mayor
                </option>
                <option value="Precio: mayor a menor">
                  Precio: mayor a menor
                </option>
                <option value="Nombre A-Z">Nombre A-Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-[var(--text-secondary)]" />
            </div>
          </div>

          {/* Botón Filtros */}
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-[5px] border border-[var(--border)] bg-white px-3 text-xs font-normal text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors cursor-pointer shadow-2xs"
          >
            <Filter className="h-3 w-3 text-[var(--text-secondary)]" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* ── Grid Principal de Tarjetas de Productos ───────────── */}
      <div className={`grid ${gridColsClass} gap-3.5 sm:gap-4 transition-all duration-300`}>
        {paginatedProducts.map((product) => {
          const isFav = Boolean(favorites[product.id]);
          return (
            <div
              key={product.id}
              className="group bg-white rounded-[5px] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all duration-200 p-3 flex flex-col justify-between shadow-2xs"
            >
              {/* Imagen del Producto + Botones Heart / More en la esquina */}
              <div>
                <div className="relative aspect-square w-full bg-[var(--surface-muted)] rounded-[5px] overflow-hidden mb-2.5 border border-[var(--border)]">
                  <ProductCardImage src={product.image} alt={product.name} />

                  {/* Acciones superiores derechas: Corazón y 3 Puntos */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="p-1 rounded-[4px] bg-white/80 hover:bg-white text-[var(--text-muted)] hover:text-accentPink transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 cursor-pointer"
                      title={isFav ? "Quitar de favoritos" : "Guardar favorito"}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-colors ${
                          isFav
                            ? "fill-accentPink text-accentPink"
                            : "text-[var(--text-muted)]"
                        }`}
                      />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="p-1 rounded-[4px] bg-white/80 hover:bg-white text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 cursor-pointer"
                          title="Más opciones"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-[150px] rounded-[5px] p-1 shadow-md border border-[var(--border)] bg-white z-50"
                      >
                        <DropdownMenuItem
                          onClick={() => showNotice(`Detalles de ${product.name}`)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] rounded-[4px] hover:bg-[var(--surface-muted)] cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          <span>Ver detalles</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            showNotice(`Viendo ${product.name} en tienda`)
                          }
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] rounded-[4px] hover:bg-[var(--surface-muted)] cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          <span>Ver en tienda</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate("/designer/personalize")}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] rounded-[4px] hover:bg-[var(--surface-muted)] cursor-pointer"
                        >
                          <Paintbrush className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          <span>Personalizar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Información del Producto */}
                <div>
                  <h3
                    className="text-xs font-bold text-[var(--text-primary)] leading-snug truncate"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5 font-normal">
                    SKU: {product.sku}
                  </p>

                  <p className="text-xs font-bold text-[var(--text-primary)] mt-1.5">
                    {product.price}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-secondary)]">
                    <Store className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate">{product.store}</span>
                  </div>

                  <p className="text-[10.5px] text-[var(--text-secondary)] mt-1 font-normal">
                    {product.availability}
                  </p>
                </div>
              </div>

              {/* Botones Inferiores: "Ver detalles" y Carrito */}
              <div className="pt-3 mt-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => showNotice(`Detalles de ${product.name}`)}
                  className="flex-1 h-8 rounded-[5px] border border-[var(--border)] bg-white text-xs font-semibold text-[var(--primary)] hover:bg-[var(--info-muted)] hover:border-[var(--primary)] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Ver detalles
                </button>
                <button
                  type="button"
                  onClick={() => showNotice(`Añadido al carrito: ${product.name}`)}
                  className="h-8 w-8 rounded-[5px] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
                  title="Comprar producto"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-[5px] border border-[var(--border)] p-12 text-center text-[var(--text-secondary)]">
          No se encontraron productos con los filtros seleccionados.
        </div>
      )}

      {/* ── Paginación Fiel a la Referencia ───────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="shrink-0 text-xs text-[var(--text-secondary)]">
          Mostrando <span className="font-normal">1 a 8 de 248 productos</span>
        </p>

        <div className="flex max-w-full shrink-0 items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
              currentPage === 1
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
            }`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
              currentPage === 2
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
            }`}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
              currentPage === 3
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
            }`}
          >
            3
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(4)}
            className={`h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
              currentPage === 4
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
            }`}
          >
            4
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(5)}
            className={`h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
              currentPage === 5
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
            }`}
          >
            5
          </button>

          <span className="h-[34px] w-7 min-w-7 shrink-0 flex items-center justify-center text-xs text-[var(--text-muted)]">
            ...
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage(31)}
            className={`h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
              currentPage === 31
                ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
            }`}
          >
            31
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(31, p + 1))}
            disabled={currentPage === 31}
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Notificación Flotante */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-50 bg-[var(--text-primary)] text-white text-xs px-3.5 py-2 rounded-[5px] shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4 text-[var(--primary)]" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
