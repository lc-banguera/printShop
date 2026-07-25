import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { useCanvasSelection } from '../hooks';

/**
 * Canvas Selection Component
 *
 * Manages the Konva Transformer for selected elements.
 * The Transformer is visually hidden but prepared for future functionality
 * (resize, rotate, etc.)
 *
 * Responsibilities:
 * - Track selected element ID from store
 * - Attach/detach transformer to selected shape
 * - Update transformer position when selection changes
 */
export function CanvasSelection() {
  const { selectedElementId } = useCanvasSelection();
  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRef = useRef<Konva.Shape | null>(null);

  useEffect(() => {
    if (!transformerRef.current) return;

    const stage = transformerRef.current.getStage();
    if (!stage) return;

    if (selectedElementId) {
      // Get the selected shape node
      const selectedNode = stage.findOne(`#${selectedElementId}`) as Konva.Shape;

      if (selectedNode) {
        shapeRef.current = selectedNode;
        transformerRef.current.nodes([selectedNode]);
      }
    } else {
      // Deselect: clear transformer nodes
      transformerRef.current.nodes([]);
      shapeRef.current = null;
    }
  }, [selectedElementId]);

  return (
    <Transformer
      ref={transformerRef}
      borderStroke="#0078d4"
      borderStrokeWidth={1}
      borderDashEnabled={false}
      anchorStroke="#ffffff"
      anchorStrokeWidth={1}
      anchorSize={8}
      anchorCornerRadius={2}
      rotateEnabled={false}
      resizeEnabled={false}
    />
  );
}
