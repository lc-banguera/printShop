import * as React from 'react';
import { Container } from '@/shared/components/Container/Container';
import { productsData } from '../../data/products.data';
import { ProductsHeader } from './ProductsHeader';
import { ProductGrid } from './ProductGrid';

export const ProductsSection: React.FC = () => {
  return (
    <section id="productos" className="w-full bg-background py-16 sm:py-20 lg:py-24">
      <Container variant="wide">
        <ProductsHeader />
        <ProductGrid products={productsData} />
      </Container>
    </section>
  );
};

export default ProductsSection;
