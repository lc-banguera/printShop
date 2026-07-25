/**
 * Canvas element types and interfaces
 */

export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'group';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity: number;
  name: string;
  locked: boolean;
  visible: boolean;
}

export interface CanvasState {
  selectedElementId: string | null;
  elements: CanvasElement[];
  selectElement: (id: string | null) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  getElement: (id: string) => CanvasElement | undefined;
}
