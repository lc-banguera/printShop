import type {
  CanvasAlignment,
  ElementUpdate,
  FlipAxis,
  TransformBounds,
} from '@/core/design/transform';
import type { DesignElement } from '@/core/design/types';

/**
 * Canvas element types and interfaces
 */

export type { CanvasLayer, ElementType } from '@/core/design/types';

export type { ArtworkFilters } from '@/core/design/processing';
export type CanvasElement = DesignElement;

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
