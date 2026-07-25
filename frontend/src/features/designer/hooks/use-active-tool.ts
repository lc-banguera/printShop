import { useToolsStore } from '@/store/tools-store';
import { getTool } from '../services/tools-config';
import type { ToolsState, ToolType, Tool } from '@/types/tools';

/**
 * Hook for accessing and managing active tool
 *
 * Returns:
 * - activeTool: Currently active tool ID
 * - activeToolData: Full tool configuration object
 * - setActiveTool: Function to change active tool
 *
 * Usage:
 *   const { activeTool, activeToolData, setActiveTool } = useActiveTool()
 *   setActiveTool('rectangle')
 */
export function useActiveTool() {
  const activeTool = useToolsStore((state: ToolsState) => state.activeTool);
  const setActiveTool = useToolsStore((state: ToolsState) => state.setActiveTool);

  const activeToolData: Tool | undefined = getTool(activeTool);

  return {
    activeTool,
    activeToolData,
    setActiveTool,
    isToolActive: (toolId: ToolType) => activeTool === toolId,
  };
}
