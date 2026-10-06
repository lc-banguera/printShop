import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { useCanvasSelection } from '../hooks';
import { useCanvasStore } from '@/store/canvas-store';

/**
 * CanvasSelection
 *
 * Connects the Konva Transformer to selected, unlocked canvas elements.
 *
 * Rotation is handled DIRECTLY on the selected element via the rotate anchor
 * (rotateEnabled=true). This is NOT the 3D camera rotation (which is handled
 * by the ProductViewer orbit controls). These two systems are completely independent:
 *   - Mouse on empty space   → 3D camera orbit
 *   - Mouse on design handle → Konva Transformer (resize / rotate)
 *
 * The rotate handle sits above the element (rotateAnchorOffset=28) giving
 * enough clearance for comfortable dragging. Rotation is persisted to the
 * Zustand canvas store on every transformend event.
 */
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
      // Capture rotation in degrees and persist it — this is DESIGN rotation, not camera
      const rotation = node.rotation(); // degrees, kept as float for precision

      // Reset scale after baking it into width/height
      node.scaleX(1);
      node.scaleY(1);

      return [{
        elementId: node.id(),
        updates: { x, y, width, height, scaleX: 1, scaleY: 1, rotation },
      }];
    });

    if (updates.length > 0) updateElements(updates);
  };

  return (
    <Transformer
      ref={transformerRef}
      // ── Bounding box style ──────────────────────────────────────────────
      borderStroke="#5046e5"
      borderStrokeWidth={1}
      borderDashEnabled={false}
      // ── Resize anchors ──────────────────────────────────────────────────
      anchorStroke="#5046e5"
      anchorFill="#ffffff"
      anchorStrokeWidth={1.5}
      anchorSize={9}
      anchorCornerRadius={2}
      // Only corner anchors — keeps UI cleaner for image elements
      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
      resizeEnabled={true}
      // ── Rotation handle ─────────────────────────────────────────────────
      // rotateEnabled=true activates the circular handle above the element.
      // rotateAnchorOffset controls how far above the bounding box the handle appears (px).
      // rotateAnchorSize is the diameter of the circular handle.
      // These are the ONLY controls for DESIGN rotation — no slider in the panel.
      rotateEnabled={true}
      rotateAnchorOffset={28}
      // ── Events ──────────────────────────────────────────────────────────
      onTransformEnd={handleTransformEnd}
    />
  );
}
