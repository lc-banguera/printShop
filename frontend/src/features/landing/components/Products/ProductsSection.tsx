import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { productsData } from "../../data/products.data";
import { ProductsHeader } from "./ProductsHeader";
import { ProductGrid } from "./ProductGrid";

export const ProductsSection: React.FC = () => {
  return (
    <section
      id="productos"
      className="relative w-full overflow-hidden border-b border-slate-200 bg-[#F6F7F8] py-20 sm:py-24 lg:py-28"
    >
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        <ProductsHeader />
        <ProductGrid products={productsData} />
      </Container>
    </section>
  );
};

export default ProductsSection;
