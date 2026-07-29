// src/features/catalog/hooks/useProductSelection.ts
import { useCallback } from 'react';
import { useViewerStore } from '@/store/viewer-store';
import { PRODUCTS } from '@/features/catalog/data/products';
import type { ProductDefinition } from '@/types/product';

/**
 * Hook that exposes the static product catalogue and a safe selection function.
 * The selection logic is isolated from UI components – RightSidebar remains
 * a pure presentation component.
 */
export function useProductSelection() {
  const setActiveProduct = useViewerStore((s) => s.setActiveProduct);

  const selectProduct = useCallback(
    (product: ProductDefinition) => {
      setActiveProduct(product);
    },
    [setActiveProduct],
  );

  return {
    products: PRODUCTS,
    selectProduct,
  };
}
