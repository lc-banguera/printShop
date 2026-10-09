import * as React from 'react';
import { Container } from '@/shared/components/Container/Container';
import { models3DData, Model3DFilterId } from '../../data/models3d.data';
import { Models3DFilters } from './Models3DFilters';
import { Models3DGrid } from './Models3DGrid';

export const Models3DSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = React.useState<Model3DFilterId>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredModels = React.useMemo(() => {
    let result = models3DData;

    // Filtro por categoría
    if (activeFilter !== 'all') {
      result = result.filter((m) => m.category === activeFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeFilter, searchQuery]);

  return (
    <section className="w-full bg-surfaceMuted py-16 sm:py-20 lg:py-24">
      <Container variant="wide">
        {/* Encabezado */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-normal text-foreground sm:text-3xl">
            Explora modelos 3D
          </h2>
        </div>

        {/* Filtros + búsqueda */}
        <Models3DFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Grid de 10 modelos: 5×2 en desktop */}
        <Models3DGrid models={filteredModels} />
      </Container>
    </section>
  );
};

export default Models3DSection;
