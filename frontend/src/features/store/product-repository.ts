import { create } from 'zustand';
import type { DynamicProductDraft } from './product-model';

export interface PublishedStoreProduct extends DynamicProductDraft { id: string; }
interface ProductRepository { products: PublishedStoreProduct[]; publish: (product: PublishedStoreProduct) => void; }

// In-memory mock repository. Replace this boundary with an API implementation later.
export const useProductRepository = create<ProductRepository>((set) => ({
  products: [],
  publish: (product) => set((state) => ({ products: [product, ...state.products.filter((item) => item.id !== product.id)] })),
}));
