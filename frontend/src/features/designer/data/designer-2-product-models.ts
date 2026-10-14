import { DEFAULT_PRODUCT } from '@/features/catalog/data/products';
import type { ProductDefinition } from '@/types/product';

/** Registry reserved for Designer 2. Only products with an existing model are enabled. */
export const designer2ProductModels: Record<string, ProductDefinition | null> = {
  camisetas: DEFAULT_PRODUCT,
  hoodies: null,
  tazas: null,
  gorras: null,
  posters: null,
  bolsos: null,
};

export function getDesigner2ProductModel(categoryId: string | null) {
  return categoryId ? designer2ProductModels[categoryId] ?? null : null;
}
