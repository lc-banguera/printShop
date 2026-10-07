import type { DesignElement } from '../types/element';
import { CommandSystem } from '../commands/command-system';
import { CompositeCommand } from '../commands/composite.command';
import type { CanvasCommandContext } from '../commands/canvas-command-context';
import { UpdateElementCommand } from '../commands/update-element.command';

export type CanvasAlignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type FlipAxis = 'horizontal' | 'vertical';

export interface TransformBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementUpdate {
  elementId: string;
  updates: Partial<DesignElement>;
}

export class TransformSystem {
  constructor(private readonly commandSystem: CommandSystem<CanvasCommandContext>) {}

  updateElements(updates: ElementUpdate[], context: CanvasCommandContext): boolean {
    const availableIds = new Set(
      context.elements.filter((element) => !element.locked).map((element) => element.id)
    );
    const uniqueUpdates = new Map<string, Partial<DesignElement>>();
    for (const update of updates) {
      if (availableIds.has(update.elementId)) {
        uniqueUpdates.set(update.elementId, {
          ...uniqueUpdates.get(update.elementId),
          ...update.updates,
        });
      }
    }
    if (uniqueUpdates.size === 0) return false;

    const commands = [...uniqueUpdates].map(
      ([elementId, patch]) => new UpdateElementCommand(elementId, patch)
    );
    const command = commands.length === 1
      ? commands[0]
      : new CompositeCommand('Transform elements', commands);
    this.commandSystem.execute(command, context);
    return true;
  }

  move(
    elementIds: string[],
    delta: { x: number; y: number },
    context: CanvasCommandContext
  ): boolean {
    return this.updateElements(
      this.findElements(elementIds, context).map((element) => ({
        elementId: element.id,
        updates: { x: element.x + delta.x, y: element.y + delta.y },
      })),
      context
    );
  }

  scale(
    elementIds: string[],
    scaleX: number,
    scaleY: number,
    context: CanvasCommandContext
  ): boolean {
    return this.updateElements(
      this.findElements(elementIds, context).map((element) => ({
        elementId: element.id,
        updates: {
          width: element.width * scaleX,
          height: element.height * scaleY,
        },
      })),
      context
    );
  }

  rotate(elementIds: string[], degrees: number, context: CanvasCommandContext): boolean {
    return this.updateElements(
      this.findElements(elementIds, context).map((element) => ({
        elementId: element.id,
        updates: { rotation: (element.rotation ?? 0) + degrees },
      })),
      context
    );
  }

  flip(elementIds: string[], axis: FlipAxis, context: CanvasCommandContext): boolean {
    return this.updateElements(
      this.findElements(elementIds, context).map((element) => ({
        elementId: element.id,
        updates: axis === 'horizontal'
          ? { scaleX: (element.scaleX ?? 1) * -1 }
          : { scaleY: (element.scaleY ?? 1) * -1 },
      })),
      context
    );
  }

  align(
    elementIds: string[],
    alignment: CanvasAlignment,
    bounds: TransformBounds,
    context: CanvasCommandContext
  ): boolean {
    const elements = this.findElements(elementIds, context);
    if (elements.length === 0) return false;

    const left = Math.min(...elements.map((element) => element.x));
    const top = Math.min(...elements.map((element) => element.y));
    const right = Math.max(...elements.map((element) => element.x + element.width));
    const bottom = Math.max(...elements.map((element) => element.y + element.height));
    let deltaX = 0;
    let deltaY = 0;

    switch (alignment) {
      case 'left':
        deltaX = bounds.x - left;
        break;
      case 'center':
        deltaX = bounds.x + bounds.width / 2 - (left + right) / 2;
        break;
      case 'right':
        deltaX = bounds.x + bounds.width - right;
        break;
      case 'top':
        deltaY = bounds.y - top;
        break;
      case 'middle':
        deltaY = bounds.y + bounds.height / 2 - (top + bottom) / 2;
        break;
      case 'bottom':
        deltaY = bounds.y + bounds.height - bottom;
        break;
    }

    return this.move(
      elements.map((element) => element.id),
      { x: deltaX, y: deltaY },
      context
    );
  }

  center(
    elementIds: string[],
    bounds: TransformBounds,
    context: CanvasCommandContext
  ): boolean {
    const elements = this.findElements(elementIds, context);
    if (elements.length === 0) return false;

    const left = Math.min(...elements.map((element) => element.x));
    const top = Math.min(...elements.map((element) => element.y));
    const right = Math.max(...elements.map((element) => element.x + element.width));
    const bottom = Math.max(...elements.map((element) => element.y + element.height));

    return this.move(
      elements.map((element) => element.id),
      {
        x: bounds.x + bounds.width / 2 - (left + right) / 2,
        y: bounds.y + bounds.height / 2 - (top + bottom) / 2,
      },
      context
    );
  }

  private findElements(elementIds: string[], context: CanvasCommandContext): DesignElement[] {
    const ids = new Set(elementIds);
    return context.elements.filter((element) => ids.has(element.id) && !element.locked);
  }
}
