import { createCommandId, type Command } from './command';
import type { CanvasCommandContext } from './canvas-command-context';

export class ReorderElementCommand implements Command<CanvasCommandContext> {
  readonly id = createCommandId('reorder-element');
  readonly name = 'Reorder element';
  private fromIndex: number | null = null;
  private toIndex: number | null = null;

  constructor(
    private readonly elementId: string,
    private readonly direction: 'up' | 'down'
  ) {}

  execute(context: CanvasCommandContext): void {
    if (this.fromIndex === null || this.toIndex === null) {
      const index = context.elements.findIndex((element) => element.id === this.elementId);
      const targetIndex = this.direction === 'up' ? index + 1 : index - 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= context.elements.length) return;

      this.fromIndex = index;
      this.toIndex = targetIndex;
    }

    this.move(context, this.fromIndex, this.toIndex);
  }

  undo(context: CanvasCommandContext): void {
    if (this.fromIndex === null || this.toIndex === null) return;
    this.move(context, this.toIndex, this.fromIndex);
  }

  redo(context: CanvasCommandContext): void {
    if (this.fromIndex === null || this.toIndex === null) return;
    this.move(context, this.fromIndex, this.toIndex);
  }

  private move(context: CanvasCommandContext, fromIndex: number, toIndex: number): void {
    const elements = [...context.elements];
    if (fromIndex < 0 || fromIndex >= elements.length || toIndex < 0 || toIndex >= elements.length) return;

    const [element] = elements.splice(fromIndex, 1);
    if (element) elements.splice(toIndex, 0, element);
    context.elements = elements;
  }
}
