import { create } from 'zustand';
import type { ToolsState, ToolType } from '@/types/tools';

/**
 * Global tools state store using Zustand
 *
 * Manages:
 * - Currently active tool
 * - Tool state persistence
 * - Tool switching logic
 *
 * Default tool: 'select'
 */
export const useToolsStore = create<ToolsState>(
  (
    set: (state: Partial<ToolsState> | ((state: ToolsState) => Partial<ToolsState>)) => void,
    get: () => ToolsState
  ) => ({
    activeTool: 'select' as ToolType,

    setActiveTool: (tool: ToolType) => {
      set({ activeTool: tool });
    },

    getActiveTool: () => {
      return get().activeTool;
    },
  })
);
