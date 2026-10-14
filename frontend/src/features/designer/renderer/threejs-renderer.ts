import type { Renderer3DAdapter } from '@/core/design/renderer';
import type { ProductSurface } from '@/core/design/types';

const calibratedSurfaces: ReadonlySet<ProductSurface['id']> = new Set(['front']);

export const threeJsRenderer: Renderer3DAdapter = {
  renderElement(element, surface) {
    if (
      !calibratedSurfaces.has(surface.id) ||
      element.zoneId !== surface.id ||
      (element.type !== 'image' && element.type !== 'text')
    ) {
      return null;
    }

    const source = element.originalImageSrc ?? element.image;
    if (!source) return null;

    return {
      kind: 'decal',
      id: element.id,
      element,
      source,
    };
  },
};
