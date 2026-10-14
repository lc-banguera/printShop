import type { ToolDescriptor, ToolId } from '@/core/design/tools';

export type ToolType = ToolId;
export type Tool = ToolDescriptor;

export interface ToolsState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  getActiveTool: () => ToolType;
}
