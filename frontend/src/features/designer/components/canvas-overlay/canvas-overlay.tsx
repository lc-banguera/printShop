import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { CANVAS_CONFIG } from '../../services';
import { useCanvasStore } from '@/store/canvas-store';
import { CanvasElements } from '../canvas-elements';
// PrintableAreaManager removed
import { CanvasSelection } from '../canvas-selection';

interface CanvasOverlayProps {
  stageSize: { width: number; height: number };
  stageScale: number;
  stageX: number;
  stageY: number;
  onStageClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onElementClick: (elementId: string) => void;
  onDragMove: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}

/**
 * CanvasOverlay
 *
 * Independent transparent Konva stage responsible STRICTLY for:
 * - User elements (images, text, logos, stickers)
 * - Selection Transformer
 * - Multi-zone printable area guides
 *
 * Has ZERO knowledge of ProductViewer, product models, or 3D rendering.
 */
export function CanvasOverlay({
  stageSize,
  stageScale,
  stageX,
  stageY,
  onStageClick,
  onElementClick,
  onDragMove,
  onDragEnd,
}: CanvasOverlayProps) {
  const elements = useCanvasStore((state) => state.elements);

  if (stageSize.width <= 0 || stageSize.height <= 0) {
    return null;
  }

  return (
    <div className="absolute inset-0">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        offsetX={-stageX / stageScale}
        offsetY={-stageY / stageScale}
        scaleX={stageScale}
        scaleY={stageScale}
        pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        onClick={onStageClick}
        onTap={onStageClick}
        className="relative z-10"
      >
      {/* Layer: Content & Multi-Zone Guides */}
      <Layer name={CANVAS_CONFIG.LAYERS.CONTENT}>

        <CanvasElements
          elements={elements}
          onElementClick={onElementClick}
          onElementDragMove={onDragMove}
          onElementDragEnd={onDragEnd}
        />
      </Layer>

      {/* Layer: Selection (Konva Transformer) */}
      <Layer name={CANVAS_CONFIG.LAYERS.SELECTION}>
        <CanvasSelection />
      </Layer>
    </Stage>
    </div>
  );
}
