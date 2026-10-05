import type { CommandSystem } from '../commands/command-system';
import type { SelectionManager } from '../selection/selection-manager';
import type { DesignerCapabilities } from '../types/capabilities';
import type { PrintShopDocument } from '../types/document';

export interface ToolViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface ToolContext<TCommandContext = unknown> {
  capabilities: DesignerCapabilities;
  document: PrintShopDocument | null;
  commandSystem: CommandSystem<TCommandContext> | null;
  selectionManager: SelectionManager | null;
  viewport: ToolViewportState | null;
}
