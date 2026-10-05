import type { PrintableZoneId } from './product';
import type {
  CanvasAlignment,
  ElementUpdate,
  FlipAxis,
  TransformBounds,
} from '@/core/design/transform';
import type { ArtworkFilters } from '@/core/design/processing';

/**
 * Canvas element types and interfaces
 */

export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'group';
export type CanvasLayer = 'user' | 'guide';

export type { ArtworkFilters } from '@/core/design/processing';

export interface CanvasElement {
  id: string;
  type: ElementType;
  layer: CanvasLayer;
  /** Zone ID to associate element with specific surface (front, back, etc.) */
  zoneId: PrintableZoneId;
  x: number;
  y: number;
  width: number;
  height: number;
  /** High-resolution image URL */
  image?: string;
  /** Full resolution image source for crisp rendering */
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
}

export interface HistoryEntry {
  elements: CanvasElement[];
}

export interface CanvasState {
  selectedElementId: string | null;
  selectedElementIds: string[];
  elements: CanvasElement[];

  /** @deprecated Compatibility snapshot projection; CommandSystem owns executable history. */
  _history: HistoryEntry[];
  /** @deprecated Compatibility cursor for _history. */
  _historyIndex: number;

  // Actions
  selectElement: (id: string | null) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;
  selectElements: (ids: string[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElements: (updates: ElementUpdate[]) => void;
  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;
  getElement: (id: string) => CanvasElement | undefined;
  duplicateElement: (id: string) => void;
  duplicateElements: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
  reorderElement: (id: string, direction: 'up' | 'down') => void;
  toggleElementLock: (id: string) => void;
  toggleElementVisibility: (id: string) => void;
  moveElements: (ids: string[], delta: { x: number; y: number }) => void;
  scaleElements: (ids: string[], scaleX: number, scaleY: number) => void;
  rotateElements: (ids: string[], degrees: number) => void;
  flipElements: (ids: string[], axis: FlipAxis) => void;
  alignElements: (ids: string[], alignment: CanvasAlignment, bounds: TransformBounds) => void;
  centerElements: (ids: string[], bounds: TransformBounds) => void;
  alignSelectedElement: (
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
    bounds: TransformBounds
  ) => void;
  groupSelectedElements: () => void;
  ungroupSelectedElements: () => void;
}
