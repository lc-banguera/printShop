import * as React from 'react';
import { Container } from '@/shared/components/Container/Container';
import { categoriesData } from '../../data/categories.data';
import { CategoryGrid } from './CategoryGrid';

export const Categories: React.FC = () => {
  return (
    <section className="w-full bg-[#F4F5FB] py-12 sm:py-16 lg:py-20">
      <Container variant="wide">
        {/* Encabezado de categorías */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Explora por categoría
          </h2>
          <a
            href="#"
            className="rounded-control text-xs font-semibold text-primary transition-colors hover:text-primaryHover sm:text-sm"
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
