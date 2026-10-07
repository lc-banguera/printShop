import type { Renderer2DAdapter } from '@/core/design/renderer';
import { getElementGeometry } from '@/core/design/transform';

export const konvaRenderer: Renderer2DAdapter = {
  renderElement(element, surface) {
    if (element.type !== 'image' || (element.zoneId && element.zoneId !== surface.id)) {
      return null;
    }

    const source = element.originalImageSrc ?? element.image;
    if (!source) return null;
    const { center } = getElementGeometry(element);

    return {
      kind: 'image',
      id: element.id,
      source,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      centerX: center.x,
      centerY: center.y,
      offsetX: element.width / 2,
      offsetY: element.height / 2,
      scaleX: Math.sign(element.scaleX ?? 1),
      scaleY: Math.sign(element.scaleY ?? 1),
      rotation: element.rotation ?? 0,
      opacity: element.opacity ?? 1,
      visible: element.visible ?? true,
    };
  },
};
