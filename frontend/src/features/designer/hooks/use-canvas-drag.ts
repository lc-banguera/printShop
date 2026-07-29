import Konva from 'konva';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';
import type { CanvasState } from '@/types/canvas';

function clampToActiveZone(
  x: number,
  y: number,
  elementWidth: number,
  elementHeight: number,
  area: { x: number; y: number; width: number; height: number }
): { x: number; y: number } {
  const minX = area.x - elementWidth + 1;
  const maxX = area.x + area.width - 1;
  const minY = area.y - elementHeight + 1;
  const maxY = area.y + area.height - 1;

  return {
    x: Math.round(Math.min(Math.max(x, minX), maxX)),
    y: Math.round(Math.min(Math.max(y, minY), maxY)),
  };
}

export function useCanvasDrag() {
  const updateElement = useCanvasStore((state: CanvasState) => state.updateElement);
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const activeZoneId = useViewerStore((state) => state.activeZoneId);

  const activeZone = activeProduct.printableAreas[activeZoneId] || {
    x: 197,
    y: 180,
    width: 400,
    height: 500,
  };

  const handleDragMove = (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Shape;
    const clamped = clampToActiveZone(
      node.x(),
      node.y(),
      node.width() * node.scaleX(),
      node.height() * node.scaleY(),
      activeZone
    );

    node.x(clamped.x);
    node.y(clamped.y);

    updateElement(elementId, clamped);
  };

  const handleDragEnd = (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Shape;
    const clamped = clampToActiveZone(
      node.x(),
      node.y(),
      node.width() * node.scaleX(),
      node.height() * node.scaleY(),
      activeZone
    );

    node.x(clamped.x);
    node.y(clamped.y);

    updateElement(elementId, clamped);
  };

  return {
    handleDragMove,
    handleDragEnd,
  };
}
