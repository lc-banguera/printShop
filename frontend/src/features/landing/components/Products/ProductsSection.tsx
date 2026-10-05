import * as React from 'react';
import { Container } from '@/shared/components/Container/Container';
import { productsData } from '../../data/products.data';
import { ProductsHeader } from './ProductsHeader';
import { ProductGrid } from './ProductGrid';

export const ProductsSection: React.FC = () => {
  return (
    <section id="productos" className="w-full bg-[#F4F5FB] py-12 sm:py-16 lg:py-20">
      <Container variant="wide">
        <ProductsHeader />
        <ProductGrid products={productsData} />
      </Container>
    </section>
  );
};

export default ProductsSection;
