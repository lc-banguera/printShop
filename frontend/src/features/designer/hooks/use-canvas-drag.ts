import Konva from 'konva';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';
import { getElementGeometry } from '@/core/design/transform';

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

    const geometries = movingElements.map(getElementGeometry);
    const left = Math.min(...geometries.map(({ bounds }) => bounds.x));
    const top = Math.min(...geometries.map(({ bounds }) => bounds.y));
    const right = Math.max(...geometries.map(({ bounds }) => bounds.x + bounds.width));
    const bottom = Math.max(...geometries.map(({ bounds }) => bounds.y + bounds.height));
    const draggedGeometry = getElementGeometry(draggedElement);
    const proposedDeltaX = node.x() - draggedGeometry.center.x;
    const proposedDeltaY = node.y() - draggedGeometry.center.y;
    const deltaX = Math.round(Math.min(
      Math.max(proposedDeltaX, activeZone.x - right + 1),
      activeZone.x + activeZone.width - left - 1
    ));
    const deltaY = Math.round(Math.min(
      Math.max(proposedDeltaY, activeZone.y - bottom + 1),
      activeZone.y + activeZone.height - top - 1
    ));

    node.x(draggedGeometry.center.x + deltaX);
    node.y(draggedGeometry.center.y + deltaY);
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
