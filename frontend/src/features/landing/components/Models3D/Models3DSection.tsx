import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { models3DData, Model3DFilterId } from "../../data/models3d.data";
import { Models3DFilters } from "./Models3DFilters";
import { Models3DGrid } from "./Models3DGrid";

export const Models3DSection: React.FC = () => {
  const [activeFilter, setActiveFilter] =
    React.useState<Model3DFilterId>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredModels = React.useMemo(() => {
    let result = models3DData;

    // Filtro por categoría
    if (activeFilter !== "all") {
      result = result.filter((m) => m.category === activeFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeFilter, searchQuery]);

  return (
    <section className="relative w-full overflow-hidden border-b border-slate-200 bg-white pb-20 pt-2 sm:pb-24 sm:pt-4 lg:pb-28 lg:pt-6">
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        {/* Encabezado refinado con jerarquía de diseño Apple */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-[#0D1014] sm:text-4xl lg:text-2xl">
              Explora modelos 3D
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Selecciona una prenda u objeto y visualiza tu diseño con rotación
              orbital e iluminación realista antes de producirlo.
            </p>
          </div>
        </div>

        {/* Filtros + búsqueda táctiles */}
        <Models3DFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Grid de 10 modelos aprobados */}
        <Models3DGrid models={filteredModels} />
      </Container>
    </section>
  );
};

export default Models3DSection;
