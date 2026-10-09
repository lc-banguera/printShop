import * as React from 'react';
import { Container } from '@/shared/components/Container/Container';
import { categoriesData } from '../../data/categories.data';
import { CategoryGrid } from './CategoryGrid';

export const Categories: React.FC = () => {
  return (
    <section className="w-full bg-surfaceMuted py-16 sm:py-20 lg:py-24">
      <Container variant="wide">
        {/* Encabezado de categorías */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <h2 className="text-2xl font-bold tracking-normal text-foreground sm:text-3xl">
            Explora por categoría
          </h2>
          <a
            href="#"
            className="rounded-control text-sm font-semibold text-primary transition-colors hover:text-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            Ver todas las categorías
          </a>
        </div>

        <CategoryGrid categories={categoriesData} />
      </Container>
    </section>
  );
};

export default Categories;
