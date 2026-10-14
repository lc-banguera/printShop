import type { DesignElement } from '../types/element';
import { createCommandId, type Command } from './command';
import type { CanvasCommandContext } from './canvas-command-context';

interface UpdatedElement {
  index: number;
  previous: DesignElement;
  next: DesignElement;
}

export class UpdateElementCommand implements Command<CanvasCommandContext> {
  readonly id = createCommandId('update-element');
  readonly name = 'Update element';
  private updates: UpdatedElement[] | null = null;

  constructor(
    private readonly elementId: string,
    private readonly patch: Partial<DesignElement>
  ) {}

  execute(context: CanvasCommandContext): void {
    if (this.updates === null) {
      this.updates = context.elements.flatMap((element, index) =>
        element.id === this.elementId
          ? [{ index, previous: element, next: { ...element, ...this.patch } }]
          : []
      );
    }
    this.redo(context);
  }

  undo(context: CanvasCommandContext): void {
    this.apply(context, 'previous');
  }

  redo(context: CanvasCommandContext): void {
    this.apply(context, 'next');
  }

  private apply(context: CanvasCommandContext, value: 'previous' | 'next'): void {
    const elements = [...context.elements];
    for (const update of this.updates ?? []) {
      if (update.index < elements.length) elements[update.index] = update[value];
    }
    context.elements = elements;
  }
}
