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
    <section className="w-full bg-[#F4F5FB] py-12 sm:py-16 lg:py-20">
      <Container variant="wide">
        {/* Encabezado */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
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
