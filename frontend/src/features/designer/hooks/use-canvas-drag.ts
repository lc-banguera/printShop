import Konva from 'konva';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';

export function useCanvasDrag() {
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const activeZoneId = useViewerStore((state) => state.activeZoneId);

  const activeZone = activeProduct.printableAreas[activeZoneId];

  const handleElementDrag = (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Shape;
    const state = useCanvasStore.getState();
    const draggedElement = state.elements.find((element) => element.id === elementId);
    if (!draggedElement || draggedElement.locked) return;

    const selectedIds = state.selectedElementIds.includes(elementId)
      ? new Set(state.selectedElementIds)
      : new Set([elementId]);
    const movingElements = state.elements.filter(
      (element) =>
        selectedIds.has(element.id) &&
        element.zoneId === draggedElement.zoneId &&
        !element.locked
    );
    if (movingElements.length === 0) return;

    const left = Math.min(...movingElements.map((element) => element.x));
    const top = Math.min(...movingElements.map((element) => element.y));
    const right = Math.max(...movingElements.map((element) => element.x + element.width));
    const bottom = Math.max(...movingElements.map((element) => element.y + element.height));
    const proposedDeltaX = node.x() - draggedElement.x;
    const proposedDeltaY = node.y() - draggedElement.y;
    const deltaX = Math.round(Math.min(
      Math.max(proposedDeltaX, activeZone.x - right + 1),
      activeZone.x + activeZone.width - left - 1
    ));
    const deltaY = Math.round(Math.min(
      Math.max(proposedDeltaY, activeZone.y - bottom + 1),
      activeZone.y + activeZone.height - top - 1
    ));

    node.x(draggedElement.x + deltaX);
    node.y(draggedElement.y + deltaY);
    if (deltaX !== 0 || deltaY !== 0) {
      state.moveElements(
        movingElements.map((element) => element.id),
        { x: deltaX, y: deltaY }
      );
    }
  };

  return {
    handleDragMove: handleElementDrag,
    handleDragEnd: handleElementDrag,
  };
}
