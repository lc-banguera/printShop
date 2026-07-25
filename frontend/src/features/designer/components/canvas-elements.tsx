import { Rect } from 'react-konva';
import Konva from 'konva';
import { useCanvasSelection } from '../hooks';
import type { CanvasElement } from '@/types/canvas';

interface CanvasElementsProps {
  elements: CanvasElement[];
  onElementClick: (elementId: string) => void;
  onElementDragMove: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onElementDragEnd: (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => void;
}

export function CanvasElements({
  elements,
  onElementClick,
  onElementDragMove,
  onElementDragEnd,
}: CanvasElementsProps) {
  const { selectedElementId } = useCanvasSelection();

  return (
    <>
      {elements.map((element) => {
        if (element.type === 'rectangle') {
          const isSelected = element.id === selectedElementId;

          return (
            <Rect
              key={element.id}
              id={element.id}
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill={element.fill}
              opacity={element.opacity}
              rotation={element.rotation}
              scaleX={element.scaleX}
              scaleY={element.scaleY}
              stroke={isSelected ? '#0078d4' : undefined}
              strokeWidth={isSelected ? 2 : 0}
              draggable={isSelected}
              onClick={() => onElementClick(element.id)}
              onTap={() => onElementClick(element.id)}
              onDragMove={(e) => onElementDragMove(element.id, e)}
              onDragEnd={(e) => onElementDragEnd(element.id, e)}
            />
          );
        }

        return null;
      })}
    </>
  );
}
