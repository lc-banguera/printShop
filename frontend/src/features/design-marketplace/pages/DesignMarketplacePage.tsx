import * as React from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { DesignMarketplaceShell, MarketplaceSectionHeading } from '../components/DesignMarketplaceShell';
import { DesignPackCard } from '../components/DesignPackCard';
import { designPackCategories } from '../data/design-packs.data';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';
import '../design-marketplace.css';

type AvailabilityFilter = 'all' | 'free' | 'paid';
type SortOrder = 'relevance' | 'newest' | 'price-low';

export const DesignMarketplacePage: React.FC = () => {
  const packs = useDesignMarketplaceStore((state) => state.packs);
  const refresh = useDesignMarketplaceStore((state) => state.refresh);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('Todas');
  const [availability, setAvailability] = React.useState<AvailabilityFilter>('all');
  const [sort, setSort] = React.useState<SortOrder>('relevance');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const filteredPacks = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = packs.filter((pack) => {
      if (pack.status !== 'published') return false;
      const matchesQuery = !normalizedQuery || [pack.title, pack.description, pack.creatorName, pack.category, ...pack.formats].join(' ').toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === 'Todas' || pack.category === category;
      const matchesAvailability = availability === 'all' || pack.access === availability;
      return matchesQuery && matchesCategory && matchesAvailability;
    });
    return [...visible].sort((first, second) => {
      if (sort === 'newest') return second.createdAt.localeCompare(first.createdAt);
      if (sort === 'price-low') return first.price - second.price;
      return Number(Boolean(second.isFixture)) - Number(Boolean(first.isFixture)) || second.designCount - first.designCount;
    });
  }, [availability, category, packs, query, sort]);

  return (
    <DesignMarketplaceShell>
      <div className="marketplace-main">
        <MarketplaceSectionHeading
          eyebrow="MarkePlace de DIseños"
          title="Diseños listos para usar"
          description="Descubre packs de autor para usar en tus productos. Hay recursos gratuitos y de compra única; no necesitas una membresía para acceder a ellos."
          action={<Link to="/designs/creator" className="marketplace-button marketplace-button-primary">Publicar un pack</Link>}
        />

        <section className="marketplace-toolbar" aria-label="Filtros del catálogo">
          <div className="marketplace-toolbar-group">
            <label className="marketplace-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Buscar packs</span>
              <input className="marketplace-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, categoría o formato" />
            </label>
          </div>
          <div className="marketplace-toolbar-group">
            <SlidersHorizontal className="hidden h-4 w-4 text-foregroundSubtle sm:block" aria-hidden="true" />
            <label>
              <span className="sr-only">Categoría</span>
              <select className="marketplace-control" value={category} onChange={(event) => setCategory(event.target.value)}>
                {designPackCategories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Disponibilidad</span>
              <select className="marketplace-control" value={availability} onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}>
                <option value="all">Todo el acceso</option>
                <option value="free">Gratis</option>
                <option value="paid">De pago</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Ordenar</span>
              <select className="marketplace-control" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
                <option value="relevance">Relevancia</option>
                <option value="newest">Más recientes</option>
                <option value="price-low">Menor precio</option>
              </select>
            </label>
          </div>
        </section>

        <div className="marketplace-results-row">
          <span className="marketplace-results-count"><strong>{filteredPacks.length}</strong> packs disponibles</span>
          <span>Originales sin membresía</span>
        </div>

        {!ready ? (
          <div className="marketplace-pack-grid" aria-label="Cargando catálogo">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="marketplace-pack-card animate-pulse"><div className="aspect-square bg-surfaceStrong" /><div className="h-32 bg-surface" /></div>)}
          </div>
        ) : filteredPacks.length > 0 ? (
          <div className="marketplace-pack-grid">
            {filteredPacks.map((pack) => <DesignPackCard key={pack.id} pack={pack} />)}
          </div>
        ) : (
          <section className="marketplace-empty" aria-live="polite">
            <Search aria-hidden="true" />
            <h2>No encontramos packs con esos filtros</h2>
            <p>Prueba con otra búsqueda o limpia los filtros para volver a ver todo el catálogo publicado.</p>
            <button type="button" className="marketplace-button marketplace-button-secondary mt-5" onClick={() => { setQuery(''); setCategory('Todas'); setAvailability('all'); }}>Limpiar filtros</button>
          </section>
        )}
      </div>
    </DesignMarketplaceShell>
  );
};
