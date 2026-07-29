import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useCanvasSelection } from '../hooks';
import type { CanvasElement } from '@/types/canvas';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';

interface CanvasElementsProps {
  elements: CanvasElement[];
  onElementClick: (elementId: string) => void;
  onElementDragMove: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onElementDragEnd: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}

interface CanvasImageElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onElementClick: (elementId: string) => void;
  onElementDragMove: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onElementDragEnd: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}

function CanvasImageElement({
  element,
  isSelected,
  onElementClick,
  onElementDragMove,
  onElementDragEnd,
}: CanvasImageElementProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const updateElement = useCanvasStore((state) => state.updateElement);

  useEffect(() => {
    // High-resolution image quality guarantee:
    // Always prefer originalImageSrc (full resolution original asset)
    const src = element.originalImageSrc ?? element.image;
    if (!src) return;

    const nextImage = new window.Image();
    nextImage.crossOrigin = 'anonymous';

    nextImage.onload = () => setImage(nextImage);
    nextImage.onerror = () => {
      const fallback = new window.Image();
      fallback.onload = () => setImage(fallback);
      fallback.src = src;
    };
    nextImage.src = src;

    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [element.originalImageSrc, element.image]);

  if (!image) return null;

  return (
    <KonvaImage
      key={element.id}
      id={element.id}
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      opacity={element.opacity ?? 1}
      rotation={element.rotation ?? 0}
      scaleX={1}
      scaleY={1}
      visible={element.visible ?? true}
      stroke={isSelected ? '#5046e5' : undefined}
      strokeWidth={isSelected ? 1 : 0}
      draggable={isSelected}
      onClick={() => onElementClick(element.id)}
      onTap={() => onElementClick(element.id)}
      onDragMove={(e) => onElementDragMove(element.id, e)}
      onDragEnd={(e) => onElementDragEnd(element.id, e)}
      onTransformEnd={(e) => {
        const node = e.target;
        const newWidth = Math.round(node.width() * node.scaleX());
        const newHeight = Math.round(node.height() * node.scaleY());
        const newX = Math.round(node.x());
        const newY = Math.round(node.y());

        node.scaleX(1);
        node.scaleY(1);

        updateElement(element.id, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          scaleX: 1,
          scaleY: 1,
        });
      }}
    />
  );
}

export function CanvasElements({
  elements,
  onElementClick,
  onElementDragMove,
  onElementDragEnd,
}: CanvasElementsProps) {
  const { selectedElementId } = useCanvasSelection();
  const activeZoneId = useViewerStore((state) => state.activeZoneId);

  // Filter elements to display ONLY those belonging to the currently active zone/surface
  const visibleElements = elements.filter(
    (el) => !el.zoneId || el.zoneId === activeZoneId
  );

  return (
    <>
      {visibleElements.map((element) => {
        if (element.type === 'image') {
          const isSelected = element.id === selectedElementId;
          return (
            <CanvasImageElement
              key={element.id}
              element={element}
              isSelected={isSelected}
              onElementClick={onElementClick}
              onElementDragMove={onElementDragMove}
              onElementDragEnd={onElementDragEnd}
            />
          );
        }

        return null;
      })}
    </>
  );
}
