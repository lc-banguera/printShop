import type { Renderer2DAdapter } from '@/core/design/renderer';

export const konvaRenderer: Renderer2DAdapter = {
  renderElement(element, surface) {
    if (element.type !== 'image' || (element.zoneId && element.zoneId !== surface.id)) {
      return null;
    }

    const source = element.originalImageSrc ?? element.image;
    if (!source) return null;

    return {
      kind: 'image',
      id: element.id,
      source,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation ?? 0,
      opacity: element.opacity ?? 1,
      visible: element.visible ?? true,
    };
  },
};
