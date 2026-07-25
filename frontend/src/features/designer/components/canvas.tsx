import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import { useCanvasSize, useCanvasDrag } from '../hooks';
import { CANVAS_CONFIG } from '../services';
import { useCanvasStore } from '@/store/canvas-store';
import { CanvasElements } from './canvas-elements';
import { CanvasSelection } from './canvas-selection';
import type { CanvasState } from '@/types/canvas';

export function Canvas() {
  const [canvasSize, containerRef] = useCanvasSize();
  const elements = useCanvasStore((state: CanvasState) => state.elements);
  const selectElement = useCanvasStore((state: CanvasState) => state.selectElement);
  const { handleDragMove, handleDragEnd } = useCanvasDrag();

  if (!canvasSize.width || !canvasSize.height) {
    return <div ref={containerRef} className="h-full w-full" />;
  }

  // Calculate stage position to center the artboard
  const stageScale = CANVAS_CONFIG.STAGE_SCALE;
  const scaledArtboardWidth = CANVAS_CONFIG.ARTBOARD_WIDTH * stageScale;
  const scaledArtboardHeight = CANVAS_CONFIG.ARTBOARD_HEIGHT * stageScale;

  const stageX = (canvasSize.width - scaledArtboardWidth) / 2;
  const stageY = (canvasSize.height - scaledArtboardHeight) / 2;

  // Handle click on background to deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectElement(null);
    }
  };

  // Handle element click
  const handleElementClick = (elementId: string) => {
    selectElement(elementId);
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-gradient-to-br from-background to-background/50"
      style={{ overflow: 'hidden' }}
    >
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        offsetX={-stageX / stageScale}
        offsetY={-stageY / stageScale}
        scaleX={stageScale}
        scaleY={stageScale}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        {/* Main Content Layer */}
        <Layer name={CANVAS_CONFIG.LAYERS.CONTENT}>
          {/* Artboard Background */}
          <Rect
            x={0}
            y={0}
            width={CANVAS_CONFIG.ARTBOARD_WIDTH}
            height={CANVAS_CONFIG.ARTBOARD_HEIGHT}
            fill={CANVAS_CONFIG.STAGE_BACKGROUND}
            stroke="#d1d5db"
            strokeWidth={1}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowBlur={8}
            shadowOffset={{ x: 0, y: 2 }}
          />

          {/* Render canvas elements with drag handlers */}
          <CanvasElements
            elements={elements}
            onElementClick={handleElementClick}
            onElementDragMove={handleDragMove}
            onElementDragEnd={handleDragEnd}
          />
        </Layer>

        {/* Selection Layer - For transformer and selection indicators */}
        <Layer name={CANVAS_CONFIG.LAYERS.SELECTION}>
          <CanvasSelection />
        </Layer>
      </Stage>
    </div>
  );
}
