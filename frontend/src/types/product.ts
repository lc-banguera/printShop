/**
 * Product domain types and interfaces
 */

export type PrintableZoneId = 'front' | 'back' | 'sleeve_left' | 'sleeve_right' | 'label';

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
}
