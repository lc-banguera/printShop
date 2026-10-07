import type { DesignElement, ProductSurface } from '../types';

export interface RenderableImage {
  kind: 'image';
  id: string;
  source: string;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  visible: boolean;
}

export type RenderableElement = RenderableImage;

export interface Renderer2DAdapter {
  renderElement(
    element: DesignElement,
    surface: Pick<ProductSurface, 'id'>
  ): RenderableElement | null;
}
