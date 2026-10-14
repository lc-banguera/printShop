import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useCanvasSelection } from '../hooks';
import type { DesignElement, ProductSurface } from '@/core/design/types';
import { konvaRenderer } from '../renderer/konva-renderer';

interface CanvasElementsProps {
  elements: DesignElement[];
  surface: Pick<ProductSurface, 'id'>;
  onElementClick: (elementId: string, additive: boolean) => void;
  onElementDragMove: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onElementDragEnd: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}

interface CanvasImageElementProps {
  item: Extract<ReturnType<typeof konvaRenderer.renderElement>, { kind: 'image' }>;
  locked: boolean;
  isSelected: boolean;
  onElementClick: (elementId: string, additive: boolean) => void;
  onElementDragMove: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onElementDragEnd: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}

function CanvasImageElement({
  item,
  locked,
  isSelected,
  onElementClick,
  onElementDragMove,
  onElementDragEnd,
}: CanvasImageElementProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.crossOrigin = 'anonymous';

    nextImage.onload = () => setImage(nextImage);
    nextImage.onerror = () => {
      const fallback = new window.Image();
      fallback.onload = () => setImage(fallback);
      fallback.src = item.source;
    };
    nextImage.src = item.source;

    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [item.source]);

  if (!image) return null;

  return (
    <KonvaImage
      key={item.id}
      id={item.id}
      image={image}
      x={item.centerX}
      y={item.centerY}
      width={item.width}
      height={item.height}
      offsetX={item.offsetX}
      offsetY={item.offsetY}
      opacity={item.opacity}
      rotation={item.rotation}
      scaleX={item.scaleX}
      scaleY={item.scaleY}
      visible={item.visible}
      stroke={isSelected ? '#5046e5' : undefined}
      strokeWidth={isSelected ? 1 : 0}
      draggable={isSelected && !locked}
      onClick={(event) =>
        onElementClick(
          item.id,
          event.evt.shiftKey || event.evt.ctrlKey || event.evt.metaKey
        )
      }
      onTap={() => onElementClick(item.id, false)}
      onDragMove={(e) => onElementDragMove(item.id, e)}
      onDragEnd={(e) => onElementDragEnd(item.id, e)}
    />
  );
}

export function CanvasElements({
  elements,
  surface,
  onElementClick,
  onElementDragMove,
  onElementDragEnd,
}: CanvasElementsProps) {
  const { selectedElementIds } = useCanvasSelection();

  return (
    <>
      {elements.map((element) => {
        const item = konvaRenderer.renderElement(element, surface);
        if (!item || item.kind !== 'image') return null;

        return (
          <CanvasImageElement
            key={item.id}
            item={item}
            locked={Boolean(element.locked)}
            isSelected={selectedElementIds.includes(item.id)}
            onElementClick={onElementClick}
            onElementDragMove={onElementDragMove}
            onElementDragEnd={onElementDragEnd}
          />
        );
      })}
    </>
  );
}
