import type { CanvasElement } from '@/types/canvas';
import { createCommandId, type Command } from './command';
import type { CanvasCommandContext } from './canvas-command-context';

export class AddElementCommand implements Command<CanvasCommandContext> {
  readonly id = createCommandId('add-element');
  readonly name = 'Add element';
  private insertionIndex: number | null = null;

  constructor(private readonly element: CanvasElement) {}

  execute(context: CanvasCommandContext): void {
    if (this.insertionIndex === null) this.insertionIndex = context.elements.length;
    this.redo(context);
  }

  undo(context: CanvasCommandContext): void {
    const index = this.findElementIndex(context.elements);
    if (index === -1) return;

    context.elements = context.elements.filter((_, elementIndex) => elementIndex !== index);
  }

  redo(context: CanvasCommandContext): void {
    const index = this.insertionIndex ?? context.elements.length;
    const elements = [...context.elements];
    elements.splice(index, 0, this.element);
    context.elements = elements;
  }

  private findElementIndex(elements: CanvasElement[]): number {
    const insertionIndex = this.insertionIndex ?? -1;
    if (elements[insertionIndex]?.id === this.element.id) return insertionIndex;

    for (let index = elements.length - 1; index >= 0; index -= 1) {
      if (elements[index]?.id === this.element.id) return index;
    }

    return -1;
  }
}
