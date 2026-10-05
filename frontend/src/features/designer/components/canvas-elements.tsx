import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useCanvasSelection } from '../hooks';
import type { CanvasElement } from '@/types/canvas';
import { useViewerStore } from '@/store/viewer-store';

interface CanvasElementsProps {
  elements: CanvasElement[];
  onElementClick: (elementId: string, additive: boolean) => void;
  onElementDragMove: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onElementDragEnd: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}

interface CanvasImageElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onElementClick: (elementId: string, additive: boolean) => void;
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
      draggable={isSelected && !element.locked}
      onClick={(event) =>
        onElementClick(
          element.id,
          event.evt.shiftKey || event.evt.ctrlKey || event.evt.metaKey
        )
      }
      onTap={() => onElementClick(element.id, false)}
      onDragMove={(e) => onElementDragMove(element.id, e)}
      onDragEnd={(e) => onElementDragEnd(element.id, e)}
    />
  );
}

export function CanvasElements({
  elements,
  onElementClick,
  onElementDragMove,
  onElementDragEnd,
}: CanvasElementsProps) {
  const { selectedElementIds } = useCanvasSelection();
  const activeZoneId = useViewerStore((state) => state.activeZoneId);

  // Filter elements to display ONLY those belonging to the currently active zone/surface
  const visibleElements = elements.filter(
    (el) => !el.zoneId || el.zoneId === activeZoneId
  );

  return (
    <>
      {visibleElements.map((element) => {
        if (element.type === 'image') {
          const isSelected = selectedElementIds.includes(element.id);
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
