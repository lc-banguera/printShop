/**
 * Product domain types and interfaces
 */

export type { PrintableZoneId } from '../../../engine/src/types/element';
import type { PrintableZoneId } from '../../../engine/src/types/element';

export interface PrintableZoneConfig {
  id: PrintableZoneId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  enabled: boolean;
  visible: boolean;
}

export interface ProductMaterial {
  id: string;
  name: string;
  color: string;
}

/**
 * View configuration for a specific product view (e.g., front, back).
 * Camera and model transforms are provided explicitly so the viewer doesn't
 * need to compute an ideal camera every time.
 */
export interface ProductViewConfig {
  id: PrintableZoneId;
  name: string;
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  defaultZoom: number; // 1.0 = normal
  modelScale: number;
  modelOffset: { x: number; y: number; z: number };
  modelRotation: { x: number; y: number; z: number }; // degrees
  printableArea?: PrintableZoneConfig;
}

export interface ProductDefinition {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  preview: string;
  /** URL reserved for future 3D .glb model integration */
  modelUrl?: string;
  printableAreas: Record<PrintableZoneId, PrintableZoneConfig>;
  /** Optional view configurations per printable zone. Viewer reads this to position camera/model. */
  viewConfigs?: Partial<Record<PrintableZoneId, ProductViewConfig>>;
  materials: ProductMaterial[];
  /**
   * Available sizes for this product/store offering.
   *
   * ARCHITECTURE NOTE (future):
   * Availability of sizes depends on the product catalogue and store configuration.
   * When the SaaS multi-store model is fully connected, this field should be populated
   * from the server (e.g., `availableSizes` from the product/offer API endpoint).
   * Different stores may offer different size ranges:
   *   - Adults: XS, S, M, L, XL, XXL
   *   - Youth: 2, 4, 6, 8, 10, 12, 14
   *   - Special: Talla Única
   * Do NOT hardcode sizes across all products; always read from this field.
   */
  availableSizes?: string[];
  /**
   * Available print methods/techniques for this product/store offering.
   *
   * ARCHITECTURE NOTE (future):
   * Print method availability depends on the store's capabilities and the product type.
   * When the SaaS model is fully connected, this should come from the product/offer API.
   * Not every store will offer all techniques (DTF, Sublimación, Vinilo, Bordado, etc.).
   * Do NOT hardcode print methods across all products; always read from this field.
   */
  availablePrintMethods?: string[];
}
