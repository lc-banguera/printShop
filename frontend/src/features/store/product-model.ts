export const MIN_PRODUCT_IMAGES = 3;
export type ProductAttributeType = 'TEXT' | 'NUMBER' | 'NUMBER_UNIT' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';
export type StoreProductCategory = 'Camisetas' | 'Hoodies' | 'Tazas' | 'Gorras' | 'Bolsos' | 'Pósters';
export type ProductStatus = 'DRAFT' | 'PUBLISHED';

export interface ProductAttributeOption { id: string; label: string; color?: string; }
export interface ProductAttributeDefinition {
  id: string; categoryId?: StoreProductCategory; name: string; label?: string; type: ProductAttributeType;
  required?: boolean; allowsMultipleValues?: boolean; allowsCustomValue?: boolean; allowsVariants?: boolean;
  allowsImageAssociation?: boolean; unit?: string; options?: ProductAttributeOption[]; order: number;
}
export interface ProductAttributeValue {
  definitionId: string; name: string; type?: ProductAttributeType; value: string | string[] | boolean | number;
  unit?: string; required?: boolean; allowsVariants?: boolean; custom?: boolean;
}
export interface ProductIdentifiers { sku: string; barcode?: string; ean?: string; upc?: string; }
export interface ProductImage { id: string; url: string; alt: string; isPrimary: boolean; variantId?: string; }
export interface ProductVariant {
  id: string; values: Record<string, string>; sku: string; identifiers?: ProductIdentifiers; price: number;
  inventory: number; imageId?: string; status: 'ACTIVE' | 'INACTIVE';
}
export interface ProductCustomization { technique?: string; zones: string[]; }
export interface DynamicProductDraft {
  id?: string; name: string; category: StoreProductCategory; sku: string; identifiers?: ProductIdentifiers;
  description: string; price: number; inventory: number; attributes: ProductAttributeValue[];
  variationAttributeIds: string[]; variants: ProductVariant[]; images: ProductImage[];
  customization: ProductCustomization; status: ProductStatus;
}

const schema = (categoryId: StoreProductCategory, entries: Array<Omit<ProductAttributeDefinition, 'categoryId' | 'order'>>) => entries.map((entry, order) => ({ ...entry, categoryId, order }));

// Optional suggestions. The form interprets this configuration generically; it
// does not branch its JSX by category or prefill product data.
export const categoryAttributeDefinitions: Record<StoreProductCategory, ProductAttributeDefinition[]> = {
  Camisetas: schema('Camisetas', [
    { id: 'material', name: 'Material', type: 'TEXT' },
    { id: 'size', name: 'Talla', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true },
    { id: 'color', name: 'Color', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true, allowsImageAssociation: true },
    { id: 'care', name: 'Cuidado', type: 'TEXT' },
  ]),
  Hoodies: schema('Hoodies', [
    { id: 'material', name: 'Material', type: 'TEXT' },
    { id: 'size', name: 'Talla', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true },
    { id: 'color', name: 'Color', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true, allowsImageAssociation: true },
    { id: 'care', name: 'Cuidado', type: 'TEXT' },
  ]),
  Tazas: schema('Tazas', [
    { id: 'material', name: 'Material', type: 'TEXT' },
    { id: 'capacity', name: 'Capacidad', type: 'NUMBER_UNIT', unit: 'oz', allowsVariants: true },
    { id: 'color', name: 'Color', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true, allowsImageAssociation: true },
    { id: 'usage', name: 'Uso', type: 'TEXT' },
  ]),
  Gorras: schema('Gorras', [
    { id: 'material', name: 'Material', type: 'TEXT' },
    { id: 'size', name: 'Talla', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true },
    { id: 'color', name: 'Color', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true, allowsImageAssociation: true },
    { id: 'closure', name: 'Cierre', type: 'TEXT' },
  ]),
  Bolsos: schema('Bolsos', [
    { id: 'material', name: 'Material', type: 'TEXT' },
    { id: 'capacity', name: 'Capacidad', type: 'NUMBER_UNIT', unit: 'L', allowsVariants: true },
    { id: 'color', name: 'Color', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true, allowsImageAssociation: true },
  ]),
  Pósters: schema('Pósters', [
    { id: 'size', name: 'Tamaño', type: 'MULTI_SELECT', allowsMultipleValues: true, allowsVariants: true, allowsCustomValue: true },
    { id: 'finish', name: 'Acabado', type: 'TEXT' },
  ]),
};
export function getAttributeDefinitions(category: StoreProductCategory) { return categoryAttributeDefinitions[category].slice().sort((a, b) => a.order - b.order); }
export function stringifyAttributeValue(attribute: ProductAttributeValue) { const value = Array.isArray(attribute.value) ? attribute.value.join(', ') : attribute.value === true ? 'Sí' : attribute.value === false ? 'No' : String(attribute.value ?? ''); return attribute.unit && value ? `${value} ${attribute.unit}` : value; }
export function skuPrefix(category: StoreProductCategory) { return ({ Camisetas: 'CAM', Hoodies: 'HOD', Tazas: 'TAZ', Gorras: 'GOR', Bolsos: 'BOL', Pósters: 'POS' } as const)[category]; }
export function createProductSku(category: StoreProductCategory, sequence = 1) { return `PS-${skuPrefix(category)}-${String(sequence).padStart(6, '0')}`; }
export function createVariantSku(parentSku: string, values: Record<string, string>) { const suffix = Object.values(values).map((value) => value.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()).filter(Boolean).join('-'); return suffix ? `${parentSku}-${suffix}` : parentSku; }
