import Konva from 'konva';
import { useCanvasStore } from '@/store/canvas-store';
import type { CanvasState } from '@/types/canvas';

/**
 * Hook for handling element drag operations
 * Updates element position in store as user drags
 */
export function useCanvasDrag() {
  const updateElement = useCanvasStore((state: CanvasState) => state.updateElement);

  const handleDragMove = (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Shape;

    updateElement(elementId, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
    });
  };

  const handleDragEnd = (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Shape;

    // Final position update on drag end
    updateElement(elementId, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
    });
  };

  return {
    handleDragMove,
    handleDragEnd,
  };
}
