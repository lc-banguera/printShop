import * as React from "react";
import { Product } from "@/features/landing/data/products.data";
import { stringifyAttributeValue } from '@/features/store/product-model';
import { ReviewSection } from "@/shared/components/reviews";
import {
  productRatingDistribution,
  sampleProductReviews,
} from "../../data/product-reviews.data";

interface ProductTabsProps {
  product: Product;
}

type TabKey = "descripcion" | "adicional" | "resenas";

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = React.useState<TabKey>("adicional");
  const specs = React.useMemo(() => (product.attributes || []).filter((attribute) => stringifyAttributeValue(attribute)).map((attribute) => ({ characteristic: attribute.name, detail: stringifyAttributeValue(attribute) })), [product.attributes]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "descripcion", label: "Descripción" },
    { key: "adicional", label: "Información adicional" },
    { key: "resenas", label: `Reseñas (${product.reviews || 142})` },
  ];

  return (
    <div className="w-full">
      {/* Tabs Header Navigation */}
      <div className="flex min-w-0 items-center gap-6 overflow-x-auto border-b border-border sm:gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-foreground"
                  : "text-foregroundMuted hover:text-foreground"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 -mb-px h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="pt-4">
        {/* Panel 1: Descripción */}
        {activeTab === "descripcion" && (
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl space-y-3">
            <p>{product.description || <>El modelo <strong>{product.name}</strong> está diseñado para ofrecer una experiencia de uso duradera.</>}</p>
            <p>
              Todos nuestros productos cuentan con procesos de personalización de última generación (impresión directa DTG, bordado de precisión o sublimación HD), manteniendo colores vibrantes e inalterables lavado tras lavado.
            </p>
          </div>
        )}

        {/* Panel 2: Información adicional (EXACTLY 2 COLUMNS: Característica | Detalle) */}
        {activeTab === "adicional" && (
          <div className="w-full overflow-x-auto rounded-control border border-border">
            <table className="w-full text-xs text-left border-collapse min-w-[320px]">
              <thead>
                <tr className="bg-primary text-primaryForeground">
                  <th className="py-2.5 px-4 font-semibold w-1/3 sm:w-1/4">Característica</th>
                  <th className="py-2.5 px-4 font-semibold w-2/3 sm:w-3/4">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((row, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-[var(--border-muted)] transition-colors ${
                        isEven ? "bg-white" : "bg-[var(--surface-muted)]"
                      }`}
                    >
                      <td className="py-2.5 px-4 font-bold text-[var(--text-primary)]">
                        {row.characteristic}
                      </td>
                      <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                        {row.detail}
                      </td>
                    </tr>
                  );
                })}
                {specs.length === 0 && <tr><td colSpan={2} className="py-4 px-4 text-[var(--text-muted)]">Este producto no tiene características adicionales publicadas.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Panel 3: Reseñas */}
        {activeTab === "resenas" && (
          <ReviewSection
            title="Opiniones del producto"
            rating={product.rating ? (product.rating > 4.5 ? 4.2 : product.rating) : 4.2}
            totalReviews={product.reviews || 142}
            distribution={productRatingDistribution}
            reviews={sampleProductReviews}
            emptyMessage="No se encontraron reseñas para este producto."
          />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
