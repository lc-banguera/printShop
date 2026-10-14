import { getProductImageUrl, getAllDiscoveredImageNames } from '../utils/productImageResolver';
import type { ProductAttributeValue, ProductCustomization, ProductImage, ProductVariant } from '@/features/store/product-model';

export type ProductAvailability = 'Disponible' | 'Pocas unidades' | 'Agotado';

export interface AvailabilityConfig {
  label: ProductAvailability;
  textColor: string;
  dotColor: string;
}

export function getAvailabilityConfig(availability?: string): AvailabilityConfig {
  switch (availability) {
    case 'Pocas unidades':
      return {
        label: 'Pocas unidades',
        textColor: 'text-[#64748B]',
        dotColor: 'bg-[#D97706]',
      };
    case 'Agotado':
      return {
        label: 'Agotado',
        textColor: 'text-[#64748B]',
        dotColor: 'bg-[#DC2626]',
      };
    case 'Disponible':
    default:
      return {
        label: 'Disponible',
        textColor: 'text-[#64748B]',
        dotColor: 'bg-[#16A34A]',
      };
  }
}

export interface ProductMetadata {
  id: string;
  imageName: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  colors: string[];
  sizes?: string[];
  category: string;
  featured?: boolean;
  rating?: number;
  reviews?: number;
  href: string;
  availability?: ProductAvailability;
}

export interface Product extends Omit<ProductMetadata, 'imageName'> {
  image: string;
  imageName: string;
  availability: ProductAvailability;
  attributes?: ProductAttributeValue[];
  variants?: ProductVariant[];
  images?: ProductImage[];
  customization?: ProductCustomization;
}

const productNames = [
  'Camiseta Oversize Premium',
  'Hoodie Clásico Custom',
  'Taza Personalizada Cerámica',
  'Gorra Bordada Custom',
  'Bolso Tote Lona Premium',
  'Sudadera Minimalista',
  'Camiseta Graphic Print',
  'Hoodie Streetwear Edition',
];

const productDescriptions = [
  'Algodón 100% • 180 GSM',
  'Algodón-Poliéster • 320 GSM',
  'Cerámica AAA • 11oz',
  'Algodón 100% • Unisex',
  'Lona Premium • 35x40 cm',
  'Algodón Orgánico • Soft Touch',
];

const productPrices = ['$ 49.900', '$ 89.900', '$ 29.900', '$ 39.900', '$ 34.900', '$ 59.900', '$ 69.900'];
const originalPricesPool = ['$ 69.900', '$ 120.000', '$ 45.000', '$ 55.000', '$ 49.000', '$ 79.900', '$ 89.900', '$ 35.000'];

const colorPalettes = [
  ['#000000', '#FFFFFF', '#EF4444', '#E50C74', '#5D46E8'],
  ['#000000', '#FFFFFF', '#6B7280', '#5D46E8', '#E50C74'],
  ['#000000', '#FFFFFF', '#EF4444', '#0284C7', '#E50C74'],
  ['#000000', '#FFFFFF', '#6B7280', '#0284C7'],
  ['#D1D5DB', '#F59E0B'],
];

const categories = ['camisetas', 'hoodies', 'tazas', 'gorras', 'bolsos', 'sudaderas'];
const reviewsCounts = [258, 142, 89, 203, 67, 178, 312, 45, 190, 87, 223, 56, 134, 265, 98, 177, 310, 72, 188, 44];

// Specific overrides for known catalog images matching reference
const specificMetadata: Record<string, Partial<ProductMetadata>> = {
  'Virtualthreads (1).png':  { name: 'Camiseta Oversize Premium',    price: '$ 49.900', originalPrice: '$ 69.900',  description: 'Algodón 100% • 180 GSM',      category: 'camisetas', availability: 'Disponible', colors: ['#000000', '#FFFFFF', '#EF4444', '#E50C74', '#5D46E8'] },
  'Virtualthreads (2).png':  { name: 'Hoodie Clásico Custom',        price: '$ 89.900', originalPrice: '$ 129.900', description: 'Algodón-Poliéster • 320 GSM', category: 'hoodies',   availability: 'Disponible', colors: ['#000000', '#FFFFFF', '#6B7280', '#5D46E8', '#E50C74'] },
  'Virtualthreads (3).png':  { name: 'Taza Personalizada Cerámica', price: '$ 29.900', originalPrice: '$ 45.900',  description: 'Cerámica AAA • 11oz',           category: 'camisetas', availability: 'Disponible', colors: ['#000000', '#0284C7', '#E50C74'] },
  'Virtualthreads (4).png':  { name: 'Gorra Bordada Custom',         price: '$ 39.900', originalPrice: '$ 55.900',  description: 'Algodón 100% • Unisex',          category: 'gorras',    availability: 'Disponible', colors: ['#FFFFFF', '#000000', '#6B7280', '#0284C7'] },
  'Virtualthreads (5).png':  { name: 'Bolso Tote Lona Premium',      price: '$ 24.900', originalPrice: '$ 34.900',  description: 'Lona Premium • 35x40 cm',        category: 'bolsos',    availability: 'Disponible', colors: ['#D1D5DB', '#F59E0B'] },
};

export function getProductsData(): Product[] {
  const discoveredImageNames = getAllDiscoveredImageNames();

  return discoveredImageNames.map((imageName, idx) => {
    const meta = specificMetadata[imageName] || {};
    const name          = meta.name          ?? productNames[idx % productNames.length];
    const description   = meta.description   ?? productDescriptions[idx % productDescriptions.length];
    const price         = meta.price         ?? productPrices[idx % productPrices.length];
    
    // Ensure all products have a realistic originalPrice so discount percentage displays coherently
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || 49900;
    let finalOriginalPrice = meta.originalPrice;
    if (!finalOriginalPrice) {
      const multipliers = [1.38, 1.42, 1.35, 1.45, 1.3];
      const mult = multipliers[idx % multipliers.length];
      const origNum = Math.round((numPrice * mult) / 1000) * 1000 - 100;
      finalOriginalPrice = `$ ${origNum.toLocaleString('es-CO')}`;
    }

    const colors        = meta.colors        ?? colorPalettes[idx % colorPalettes.length];
    const category      = meta.category      ?? categories[idx % categories.length];
    const isApparel     = category === 'camisetas' || category === 'hoodies' || category === 'sudaderas';
    const sizes         = meta.sizes         ?? (isApparel ? ['S', 'M', 'L', 'XL'] : undefined);
    const reviews       = reviewsCounts[idx % reviewsCounts.length];
    const availability: ProductAvailability =
      meta.availability ??
      (idx === 2 ? 'Pocas unidades' : idx === 4 ? 'Agotado' : 'Disponible');

    return {
      id: `prod-${idx + 1}`,
      imageName,
      name,
      description,
      price,
      originalPrice: finalOriginalPrice,
      image: getProductImageUrl(imageName),
      colors,
      sizes,
      category,
      featured: idx < 5,
      rating: 4 + (idx % 5) * 0.2,
      reviews,
      href: `/products/prod-${idx + 1}`,
      availability,
    };
  });
}

export const productsData: Product[] = getProductsData();

/** Returns a human-readable category name for display in UI. */
export function getCategoryDisplayName(category: string): string {
  const map: Record<string, string> = {
    camisetas: 'Camisetas',
    hoodies:   'Hoodies',
    tazas:     'Tazas',
    gorras:    'Gorras',
    bolsos:    'Bolsas',
    sudaderas: 'Sudaderas',
    pósters:   'Pósters',
    posters:   'Pósters',
  };
  return map[category?.toLowerCase()] ?? category;
}
