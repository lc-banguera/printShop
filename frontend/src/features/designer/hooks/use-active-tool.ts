import { useToolsStore } from '@/store/tools-store';
import { toolRegistry } from '@/core/design/tools';
import type { DesignerCapabilities } from '@/core/design/types';
import type { ToolContext } from '@/core/design/tools';
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
  const activateTool = <TCommandContext,>(
    toolId: ToolType,
    context: ToolContext<TCommandContext>
  ) => {
    toolRegistry.transition(activeTool, toolId, context);
    setActiveTool(toolId);
  };
  const getAvailableTools = (capabilities: DesignerCapabilities) =>
    toolRegistry.getAvailableTools(capabilities);

  return {
    activeTool,
    activeToolData,
    setActiveTool,
    activateTool,
    getAvailableTools,
    isToolActive: (toolId: ToolType) => activeTool === toolId,
  };
}
