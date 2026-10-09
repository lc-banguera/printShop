import type { VectorPath } from '../paths';

export type PrintableZoneId = 'front' | 'back' | 'sleeve_left' | 'sleeve_right' | 'label';
export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'group' | 'path';
export type CanvasLayer = 'user' | 'guide';

export interface DocumentPath extends VectorPath {
  schemaVersion: '1.0.0';
}

export interface ArtworkFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  invert: number;
  blur: number;
}

export interface DesignElement {
  id: string;
  type: ElementType;
  layer: CanvasLayer;
  zoneId: PrintableZoneId;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
  originalImageSrc?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  name?: string;
  locked?: boolean;
  visible?: boolean;
  filters?: ArtworkFilters;
  textContent?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  path?: DocumentPath;
}
