import * as React from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/features/landing/components/Header/Header";
import { Footer } from "@/features/landing/components/Footer/Footer";
import { Container } from "@/shared/components/Container/Container";
import { productsData, getCategoryDisplayName, type Product } from "@/features/landing/data/products.data";
import { Breadcrumb } from "./components/Breadcrumb/Breadcrumb";
import { ProductGallery } from "./components/Gallery/ProductGallery";
import { ProductInfo } from "./components/ProductInfo/ProductInfo";
import { ProductTabs } from "./components/Tabs/ProductTabs";
import { RelatedProducts } from "./components/Related/RelatedProducts";
import { useProductRepository } from '@/features/store/product-repository';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sellerProducts = useProductRepository((state) => state.products);

  // Find product by id (or fallback to the first product if on `/products` with no specific param)
  const product = React.useMemo<Product>(() => {
    if (!id) return productsData[0];
    const sellerProduct = sellerProducts.find((item) => item.id === id);
    if (sellerProduct) {
      const primary = sellerProduct.images.find((image) => image.isPrimary) || sellerProduct.images[0];
      const color = sellerProduct.attributes.find((attribute) => attribute.definitionId === 'color')?.value;
      const size = sellerProduct.attributes.find((attribute) => attribute.definitionId === 'size')?.value;
      return {
        id: sellerProduct.id, name: sellerProduct.name, description: sellerProduct.description, category: sellerProduct.category.toLowerCase(),
        price: `$ ${sellerProduct.price.toLocaleString('es-CO')}`, image: primary?.url || '', imageName: primary?.alt || sellerProduct.name,
        colors: Array.isArray(color) ? color.map((item) => colorHex(item)) : [], sizes: Array.isArray(size) ? size : undefined,
        href: `/products/${sellerProduct.id}`, availability: sellerProduct.inventory > 0 ? 'Disponible' as const : 'Agotado' as const, attributes: sellerProduct.attributes,
        variants: sellerProduct.variants, images: sellerProduct.images, customization: sellerProduct.customization, rating: 0, reviews: 0,
      };
    }
    return productsData.find((p) => p.id === id) || productsData[0];
  }, [id, sellerProducts]);

  // Scroll to top when product id changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product.id]);

  if (!product) {
    return <Navigate to="/" replace />;
  }

  // Thumbnails from other products of same or similar category to populate gallery
  const relatedThumbnails = React.useMemo(() => {
    return productsData
      .filter((p) => p.id !== product.id && p.image)
      .slice(0, 4)
      .map((p) => p.image);
  }, [product.id]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Productos", href: "/#productos" },
    { label: getCategoryDisplayName(product.category), href: "/#productos" },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen flex min-w-0 flex-col bg-background">
      {/* ── 1. Header (Identical to Landing) ─────────────────────────── */}
      <Header />

      {/* ── 2. Breadcrumb (Dynamic according to selected product) ─────── */}
      <Breadcrumb items={breadcrumbItems} />

      {/* ── 3. Main Product Section ───────────────────────────────────── */}
      <main className="flex-1">
        <Container variant="wide" className="py-6 sm:py-8 lg:py-10">
          {/* 2-Column Responsive Layout: Gallery (Left) | Info (Right) */}
          <div className="grid min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Gallery (~5 cols) */}
            <div className="w-full min-w-0 lg:col-span-6 xl:col-span-6">
              <ProductGallery
                product={product}
                relatedThumbnails={relatedThumbnails}
              />
            </div>

            {/* Right Column: Product Information (~6 cols) */}
            <div className="w-full min-w-0 lg:col-span-6 xl:col-span-6">
              <ProductInfo product={product} />
            </div>
          </div>
        </Container>

        {/* ── 4. Tabs + Table (2 columns, dynamic specs) ─────────────────── */}
        <div className="mt-4 border-t border-borderMuted">
          <Container variant="wide" className="py-6 sm:py-8">
            <ProductTabs product={product} />
          </Container>
        </div>

        {/* ── 5. Related Products (Dynamic from productsData) ────────────── */}
        <div className="border-t border-borderMuted bg-surfaceMuted">
          <Container variant="wide" className="py-6 sm:py-8">
            <RelatedProducts
              currentProductId={product.id}
              allProducts={productsData}
            />
          </Container>
        </div>
      </main>

      {/* ── 6. Footer (Identical to Landing) ─────────────────────────── */}
      <Footer />
    </div>
  );
};

function colorHex(color: string) {
  return ({ Negro: '#000000', Blanco: '#FFFFFF', Gris: '#6B7280', 'Azul marino': '#1E3A8A', 'Gris oscuro': '#374151', 'Blanco hueso': '#E7E5E4', Natural: '#D6D3D1', Beige: '#D6C3A3', 'Verde militar': '#4B5320' } as Record<string, string>)[color] || '#64748B';
}

export default ProductDetailPage;
