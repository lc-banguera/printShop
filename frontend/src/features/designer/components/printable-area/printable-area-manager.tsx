import { Rect } from 'react-konva';
import { useViewerStore } from '@/store/viewer-store';

/**
 * PrintableAreaManager
 *
 * Multi-zone manager component that renders the dashed green guide rectangle
 * corresponding to the active printable zone of the product.
 * Non-interactive (`listening={false}`).
 */
export function PrintableAreaManager() {
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const activeZoneId = useViewerStore((state) => state.activeZoneId);

  const currentZoneConfig = activeProduct.printableAreas[activeZoneId];

  if (!currentZoneConfig || !currentZoneConfig.visible) {
    return null;
  }

  return (
    <Rect
      x={currentZoneConfig.x}
      y={currentZoneConfig.y}
      width={currentZoneConfig.width}
      height={currentZoneConfig.height}
      rotation={currentZoneConfig.rotation ?? 0}
      fill="transparent"
      stroke="#10b981" // emerald-500 guide color
      strokeWidth={1.5}
      dash={[6, 6]}
      cornerRadius={8}
      listening={false}
    />
  );
}
