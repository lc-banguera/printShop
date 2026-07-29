import type { PrintableZoneId } from './product';

/**
 * Canvas element types and interfaces
 */

export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'group';
export type CanvasLayer = 'user' | 'guide';

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
}

export interface HistoryEntry {
  elements: CanvasElement[];
}

export interface CanvasState {
  selectedElementId: string | null;
  selectedElementIds: string[];
  elements: CanvasElement[];

  /** History scaffold for future undo/redo */
  _history: HistoryEntry[];
  _historyIndex: number;

  // Actions
  selectElement: (id: string | null) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  getElement: (id: string) => CanvasElement | undefined;
  duplicateElement: (id: string) => void;
  undo: () => void;
  redo: () => void;
  alignSelectedElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  groupSelectedElements: () => void;
  ungroupSelectedElements: () => void;
}
