import type { DesignElement } from '../types/element';
import { createCommandId, type Command } from '../commands/command';
import type { CanvasCommandContext } from '../commands/canvas-command-context';
import { ReorderElementCommand } from '../commands/reorder-element.command';
import { UpdateElementCommand } from '../commands/update-element.command';

export class ReorderLayerCommand extends ReorderElementCommand {
  override readonly name = 'Reorder layer';
}

abstract class ToggleLayerPropertyCommand implements Command<CanvasCommandContext> {
  readonly id: string;
  readonly name: string;
  private updateCommand: UpdateElementCommand | null = null;

  protected constructor(
    private readonly layerId: string,
    name: string,
    private readonly property: 'locked' | 'visible',
    private readonly getNextValue: (element: DesignElement) => boolean
  ) {
    this.id = createCommandId(`toggle-layer-${property}`);
    this.name = name;
  }

  execute(context: CanvasCommandContext): void {
    if (this.updateCommand === null) {
      const layer = context.elements.find((element) => element.id === this.layerId);
      if (!layer) return;
      this.updateCommand = new UpdateElementCommand(this.layerId, {
        [this.property]: this.getNextValue(layer),
      });
    }
    this.updateCommand.execute(context);
  }

  undo(context: CanvasCommandContext): void {
    this.updateCommand?.undo(context);
  }

  redo(context: CanvasCommandContext): void {
    this.updateCommand?.redo(context);
  }
}

export class ToggleLayerLockCommand extends ToggleLayerPropertyCommand {
  constructor(layerId: string) {
    super(layerId, 'Toggle layer lock', 'locked', (element) => !element.locked);
  }
}

export class ToggleLayerVisibilityCommand extends ToggleLayerPropertyCommand {
  constructor(layerId: string) {
    super(layerId, 'Toggle layer visibility', 'visible', (element) => element.visible === false);
  }
}
