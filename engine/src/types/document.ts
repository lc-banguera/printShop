import type { DesignElement, PrintableZoneId } from './element';

export interface ProductReference {
  id: string;
}

export interface DocumentMetadata {
  [key: string]: JsonValue;
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface CoordinateSystem {
  origin: 'top-left';
  unit: 'px';
  width: number;
  height: number;
}

export interface PrintableArea {
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

export type SafeArea = Pick<PrintableArea, 'x' | 'y' | 'width' | 'height'>;

export interface BleedConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: 'px' | 'mm';
}

export interface Layer {
  id: string;
  name: string;
  order: number;
  locked: boolean;
  visible: boolean;
  elements: DesignElement[];
}

export interface ProductSurface {
  id: PrintableZoneId;
  name: string;
  printableArea: PrintableArea;
  safeArea?: SafeArea;
  bleed?: BleedConfig;
  layers: Layer[];
  coordinateSystem: CoordinateSystem;
}

export interface PrintShopDocument {
  id: string;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  product: ProductReference;
  surfaces: ProductSurface[];
  metadata: DocumentMetadata;
}
