import type { CanvasCommandContext } from '../commands/canvas-command-context';
import { CommandSystem } from '../commands/command-system';
import {
  ReorderLayerCommand,
  ToggleLayerLockCommand,
  ToggleLayerVisibilityCommand,
} from './layer-commands';

export class LayerManager {
  constructor(private readonly commandSystem: CommandSystem<CanvasCommandContext>) {}

  reorder(
    layerId: string,
    direction: 'up' | 'down',
    context: CanvasCommandContext
  ): boolean {
    const index = context.elements.findIndex((element) => element.id === layerId);
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= context.elements.length) return false;

    this.commandSystem.execute(new ReorderLayerCommand(layerId, direction), context);
    return true;
  }

  toggleLock(layerId: string, context: CanvasCommandContext): boolean {
    if (!context.elements.some((element) => element.id === layerId)) return false;

    this.commandSystem.execute(new ToggleLayerLockCommand(layerId), context);
    return true;
  }

  toggleVisibility(layerId: string, context: CanvasCommandContext): boolean {
    if (!context.elements.some((element) => element.id === layerId)) return false;

    this.commandSystem.execute(new ToggleLayerVisibilityCommand(layerId), context);
    return true;
  }
}
