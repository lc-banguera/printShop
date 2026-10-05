import { useCanvasStore } from '@/store/canvas-store';
import type { CanvasState } from '@/types/canvas';

export function useCanvasSelection() {
  const selectedElementId = useCanvasStore((state: CanvasState) => state.selectedElementId);
  const selectedElementIds = useCanvasStore((state: CanvasState) => state.selectedElementIds);
  const selectElement = useCanvasStore((state: CanvasState) => state.selectElement);
  const getElement = useCanvasStore((state: CanvasState) => state.getElement);

  const selectedElement = selectedElementId ? getElement(selectedElementId) : null;

  return {
    selectedElementId,
    selectedElementIds,
    selectedElement,
    selectElement,
  };
}
