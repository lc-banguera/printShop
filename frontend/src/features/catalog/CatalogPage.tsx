import * as React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { Container } from '@/shared/components/Container/Container';
import { ProductCard } from '@/features/landing/components/Products/ProductCard';
import { getCategoryDisplayName, productsData, type Product, type ProductAvailability } from '@/features/landing/data/products.data';
import { getColorName } from '@/features/landing/data/product-attributes';
import './catalog.css';

type SortOption = 'featured' | 'name' | 'price-low' | 'price-high';

const availabilityOrder: ProductAvailability[] = ['Disponible', 'Pocas unidades', 'Agotado'];

function numericPrice(product: Product) {
  return Number.parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getCurrencyToken(value: string) {
  return value.match(/[^\d\s.,-]+/)?.[0] ?? '';
}

function getPriceBounds(products: Product[]) {
  const currencies = new Set(products.map((product) => getCurrencyToken(product.price)).filter(Boolean));
  if (currencies.size !== 1) return null;

  const values = products.map(numericPrice).filter((value) => value > 0);
  if (!values.length) return null;

  return {
    currency: Array.from(currencies)[0],
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function FilterOption({
  active,
  label,
  onClick,
  count,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      className={`catalog-filter-option${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span>{label}</span>
      {count !== undefined ? <span className="catalog-filter-count">{count}</span> : null}
    </button>
  );
}

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState(() => searchParams.get('category') || 'all');
  const [color, setColor] = React.useState('all');
  const [size, setSize] = React.useState('all');
  const [availability, setAvailability] = React.useState<'all' | ProductAvailability>('all');
  const [priceFrom, setPriceFrom] = React.useState<number | null>(null);
  const [priceTo, setPriceTo] = React.useState<number | null>(null);
  const [sort, setSort] = React.useState<SortOption>('featured');
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const categories = React.useMemo(
    () => uniqueValues(productsData.map((product) => product.category)).sort((a, b) => getCategoryDisplayName(a).localeCompare(getCategoryDisplayName(b), 'es')),
    [],
  );
  const colors = React.useMemo(() => uniqueValues(productsData.flatMap((product) => product.colors)), []);
  const sizes = React.useMemo(() => uniqueValues(productsData.flatMap((product) => product.sizes ?? [])).sort((a, b) => a.localeCompare(b, 'es')), []);
  const priceBounds = React.useMemo(() => getPriceBounds(productsData), []);

  React.useEffect(() => {
    const requestedCategory = searchParams.get('category');
    setCategory(requestedCategory && categories.includes(requestedCategory) ? requestedCategory : 'all');
  }, [categories, searchParams]);

  const effectivePriceFrom = priceFrom ?? priceBounds?.min ?? 0;
  const effectivePriceTo = priceTo ?? priceBounds?.max ?? Number.MAX_SAFE_INTEGER;

  const filteredProducts = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = productsData.filter((product) => {
      const searchableText = [product.name, product.description, product.category, getCategoryDisplayName(product.category)].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesCategory = category === 'all' || product.category === category;
      const matchesColor = color === 'all' || product.colors.includes(color);
      const matchesSize = size === 'all' || Boolean(product.sizes?.includes(size));
      const matchesAvailability = availability === 'all' || product.availability === availability;
      const price = numericPrice(product);
      const matchesPrice = !priceBounds || (price >= effectivePriceFrom && price <= effectivePriceTo);
      return matchesQuery && matchesCategory && matchesColor && matchesSize && matchesAvailability && matchesPrice;
    });

    return [...visible].sort((first, second) => {
      if (sort === 'name') return first.name.localeCompare(second.name, 'es');
      if (sort === 'price-low') return numericPrice(first) - numericPrice(second);
      if (sort === 'price-high') return numericPrice(second) - numericPrice(first);
      return Number(Boolean(second.featured)) - Number(Boolean(first.featured)) || first.name.localeCompare(second.name, 'es');
    });
  }, [availability, category, color, effectivePriceFrom, effectivePriceTo, priceBounds, query, size, sort]);

  const hasPriceFilter = Boolean(priceBounds && (priceFrom !== null || priceTo !== null));
  const activeFilterCount = [category !== 'all', color !== 'all', size !== 'all', availability !== 'all', hasPriceFilter].filter(Boolean).length;
  const hasActiveFilters = Boolean(query.trim()) || activeFilterCount > 0;

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setColor('all');
    setSize('all');
    setAvailability('all');
    setPriceFrom(null);
    setPriceTo(null);
  };

  const categoryCounts = React.useMemo(
    () => new Map(categories.map((item) => [item, productsData.filter((product) => product.category === item).length])),
    [categories],
  );

  return (
    <div className="catalog-shell">
      <Header />
      <main>
       
<section className="catalog-heading">
  <Container
    variant="wide"
    className="px-4 sm:px-6 lg:px-8"
    style={{ textAlign: 'center' }}
  >
    <p className="catalog-eyebrow">
      Productos para personalizar
    </p>

    <h1>Catálogo de productos</h1>

    <p>
      Explora productos disponibles, compara sus opciones y elige uno para comenzar a personalizarlo.
    </p>

    <label
      className="catalog-search"
      style={{ marginInline: 'auto', textAlign: 'left' }}
    >
      <Search aria-hidden="true" />
      <span className="sr-only">Buscar productos</span>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nombre, descripción o categoría"
      />

      {query ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => setQuery('')}
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
    </label>
  </Container>
</section>


        <Container variant="wide" className="catalog-layout px-4 sm:px-6 lg:px-8">
          <button type="button" className="catalog-mobile-filter-trigger" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen((current) => !current)}>
            <span><SlidersHorizontal aria-hidden="true" /> Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            <span>{filtersOpen ? 'Ocultar' : 'Mostrar'}</span>
          </button>

          <aside id="catalog-filters" className={`catalog-filters${filtersOpen ? ' is-open' : ''}`} aria-label="Filtros del catálogo">
            <div className="catalog-filter-header">
              <h2>Filtrar productos</h2>
              {hasActiveFilters ? <button type="button" onClick={clearFilters}>Limpiar</button> : null}
            </div>

            <section className="catalog-filter-group" aria-labelledby="catalog-category-heading">
              <h3 id="catalog-category-heading">Categorías</h3>
              <div className="catalog-filter-options">
                <FilterOption active={category === 'all'} label="Todas" count={productsData.length} onClick={() => setCategory('all')} />
                {categories.map((item) => (
                  <FilterOption key={item} active={category === item} label={getCategoryDisplayName(item)} count={categoryCounts.get(item)} onClick={() => setCategory(item)} />
                ))}
              </div>
            </section>

            {colors.length > 0 ? (
              <section className="catalog-filter-group" aria-labelledby="catalog-color-heading">
                <h3 id="catalog-color-heading">Color</h3>
                <div className="catalog-color-options">
                  <button type="button" className={`catalog-color-option${color === 'all' ? ' is-active' : ''}`} aria-pressed={color === 'all'} onClick={() => setColor('all')}>
                    <span className="catalog-color-swatch catalog-color-swatch-all" aria-hidden="true" />
                    <span>Todos</span>
                  </button>
                  {colors.map((value, index) => (
                    <button key={value} type="button" className={`catalog-color-option${color === value ? ' is-active' : ''}`} aria-pressed={color === value} onClick={() => setColor(value)}>
                      <span className="catalog-color-swatch" style={{ backgroundColor: value }} aria-hidden="true" />
                      <span>{getColorName(value, index)}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {sizes.length > 0 ? (
              <section className="catalog-filter-group" aria-labelledby="catalog-size-heading">
                <h3 id="catalog-size-heading">Talla</h3>
                <div className="catalog-filter-options catalog-filter-options-inline">
                  <FilterOption active={size === 'all'} label="Todas" onClick={() => setSize('all')} />
                  {sizes.map((item) => <FilterOption key={item} active={size === item} label={item} onClick={() => setSize(item)} />)}
                </div>
              </section>
            ) : null}

            <section className="catalog-filter-group" aria-labelledby="catalog-availability-heading">
              <h3 id="catalog-availability-heading">Disponibilidad</h3>
              <div className="catalog-filter-options">
                <FilterOption active={availability === 'all'} label="Todas" onClick={() => setAvailability('all')} />
                {availabilityOrder.filter((item) => productsData.some((product) => product.availability === item)).map((item) => (
                  <FilterOption key={item} active={availability === item} label={item} onClick={() => setAvailability(item)} />
                ))}
              </div>
            </section>

            {priceBounds ? (
              <section className="catalog-filter-group" aria-labelledby="catalog-price-heading">
                <h3 id="catalog-price-heading">Precio ({priceBounds.currency})</h3>
                <div className="catalog-price-range">
                  <label>
                    <span>Desde</span>
                    <input
                      type="number"
                      min={priceBounds.min}
                      max={effectivePriceTo}
                      step="100"
                      value={priceFrom ?? priceBounds.min}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        setPriceFrom(Number.isFinite(next) ? Math.min(next, effectivePriceTo) : priceBounds.min);
                      }}
                    />
                  </label>
                  <label>
                    <span>Hasta</span>
                    <input
                      type="number"
                      min={effectivePriceFrom}
                      max={priceBounds.max}
                      step="100"
                      value={priceTo ?? priceBounds.max}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        setPriceTo(Number.isFinite(next) ? Math.max(next, effectivePriceFrom) : priceBounds.max);
                      }}
                    />
                  </label>
                </div>
              </section>
            ) : null}
          </aside>

          <section className="catalog-results" aria-labelledby="catalog-results-heading">
            <div className="catalog-results-toolbar">
              <div>
                <p className="catalog-results-count"><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}</p>
                {hasActiveFilters ? <div className="catalog-active-filters" aria-label="Filtros activos">
                  {query.trim() ? <button type="button" onClick={() => setQuery('')}>“{query.trim()}” <X aria-hidden="true" /></button> : null}
                  {category !== 'all' ? <button type="button" onClick={() => setCategory('all')}>{getCategoryDisplayName(category)} <X aria-hidden="true" /></button> : null}
                  {color !== 'all' ? <button type="button" onClick={() => setColor('all')}>{getColorName(color)} <X aria-hidden="true" /></button> : null}
                  {size !== 'all' ? <button type="button" onClick={() => setSize('all')}>{size} <X aria-hidden="true" /></button> : null}
                  {availability !== 'all' ? <button type="button" onClick={() => setAvailability('all')}>{availability} <X aria-hidden="true" /></button> : null}
                  {hasPriceFilter ? <button type="button" onClick={() => { setPriceFrom(null); setPriceTo(null); }}>{priceBounds?.currency} {effectivePriceFrom.toLocaleString('es-CO')}–{effectivePriceTo.toLocaleString('es-CO')} <X aria-hidden="true" /></button> : null}
                </div> : null}
              </div>
              <label className="catalog-sort">
                <span>Ordenar por</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
                  <option value="featured">Destacados</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="price-low">Precio menor</option>
                  <option value="price-high">Precio mayor</option>
                </select>
              </label>
            </div>

            <h2 id="catalog-results-heading" className="sr-only">Productos del catálogo</h2>
            {filteredProducts.length > 0 ? (
              <div className="catalog-product-grid">
                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} showPromotions={false} showShipping={false} />)}
              </div>
            ) : (
              <section className="catalog-empty" aria-live="polite">
                <h2>No encontramos productos</h2>
                <p>Prueba con otra búsqueda o quita algún filtro para consultar el catálogo completo.</p>
                <button type="button" className="catalog-button catalog-button-secondary" onClick={clearFilters}>Limpiar filtros</button>
              </section>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default CatalogPage;
