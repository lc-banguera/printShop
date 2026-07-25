/**
 * Designer tool types and interfaces
 */

export type ToolType = 'select' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'image' | 'hand' | 'zoom';

export interface Tool {
  id: ToolType;
  name: string;
  icon: string;
  description: string;
  category: 'selection' | 'shape' | 'drawing' | 'view' | 'asset';
  cursor: string;
}

export interface ToolsState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  getActiveTool: () => ToolType;
}
