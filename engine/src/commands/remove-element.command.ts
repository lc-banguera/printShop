import type { DesignElement } from '../types/element';
import { createCommandId, type Command } from './command';
import type { CanvasCommandContext } from './canvas-command-context';

interface RemovedElement {
  index: number;
  element: DesignElement;
}

export class RemoveElementCommand implements Command<CanvasCommandContext> {
  readonly id = createCommandId('remove-element');
  readonly name = 'Remove element';
  private removedElements: RemovedElement[] | null = null;

  constructor(private readonly elementId: string) {}

  execute(context: CanvasCommandContext): void {
    if (this.removedElements === null) {
      this.removedElements = context.elements.flatMap((element, index) =>
        element.id === this.elementId ? [{ index, element }] : []
      );
    }
    this.redo(context);
  }

  undo(context: CanvasCommandContext): void {
    const elements = [...context.elements];
    for (const removed of this.removedElements ?? []) {
      elements.splice(removed.index, 0, removed.element);
    }
    context.elements = elements;
  }

  redo(context: CanvasCommandContext): void {
    context.elements = context.elements.filter((element) => element.id !== this.elementId);
  }
}
