import type { DesignElement, ProductSurface } from '../types';

export interface RenderableDecal3D {
  kind: 'decal';
  id: string;
  element: DesignElement;
  source: string;
}

export interface Renderer3DAdapter {
  renderElement(
    element: DesignElement,
    surface: Pick<ProductSurface, 'id'>
  ): RenderableDecal3D | null;
}
