import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { useCanvasSelection } from '../hooks';
import { useCanvasStore } from '@/store/canvas-store';

/** Connects the Konva Transformer to selected, unlocked elements and commits batch resizes. */
export function CanvasSelection() {
  const { selectedElementIds } = useCanvasSelection();
  const transformerRef = useRef<Konva.Transformer>(null);
  const elements = useCanvasStore((state) => state.elements);
  const updateElements = useCanvasStore((state) => state.updateElements);

  useEffect(() => {
    if (!transformerRef.current) return;

    const stage = transformerRef.current.getStage();
    if (!stage) return;

    const selectedNodes = selectedElementIds
      .map((elementId) => stage.findOne(`#${elementId}`))
      .filter((node): node is Konva.Shape => node instanceof Konva.Shape)
      .filter((node) => !elements.find((element) => element.id === node.id())?.locked);

    transformerRef.current.nodes(selectedNodes);
  }, [elements, selectedElementIds]);

  const handleTransformEnd = () => {
    const nodes = transformerRef.current?.nodes() ?? [];
    const updates = nodes.flatMap((node) => {
      if (!(node instanceof Konva.Shape)) return [];

      const width = Math.round(node.width() * node.scaleX());
      const height = Math.round(node.height() * node.scaleY());
      const x = Math.round(node.x());
      const y = Math.round(node.y());
      node.scaleX(1);
      node.scaleY(1);

      return [{
        elementId: node.id(),
        updates: { x, y, width, height, scaleX: 1, scaleY: 1 },
      }];
    });

    if (updates.length > 0) updateElements(updates);
  };

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
      resizeEnabled={true}
      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
      onTransformEnd={handleTransformEnd}
    />
  );
}
