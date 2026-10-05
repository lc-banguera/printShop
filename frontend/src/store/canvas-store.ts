import { create } from 'zustand';
import type { CanvasState, CanvasElement } from '@/types/canvas';
import {
  AddElementCommand,
  CommandSystem,
  RemoveElementCommand,
  ReorderElementCommand,
  UpdateElementCommand,
  type CanvasCommandContext,
} from '@/core/design/commands';

function cloneElements(elements: CanvasElement[]) {
  return elements.map((element) => ({ ...element }));
}

export const useCanvasStore = create<CanvasState>(
  (
    set: (state: Partial<CanvasState> | ((state: CanvasState) => Partial<CanvasState>)) => void,
    get: () => CanvasState
  ) => {
    const commandSystem = new CommandSystem<CanvasCommandContext>();

    function executeCommand(command: Parameters<typeof commandSystem.execute>[0], nextState: Partial<CanvasState> = {}) {
      const state = get();
      const context: CanvasCommandContext = { elements: state.elements };
      commandSystem.execute(command, context);

      const nextHistory = [
        ...state._history.slice(0, state._historyIndex + 1),
        { elements: cloneElements(state.elements) },
      ];

      set({
        ...nextState,
        elements: context.elements,
        _history: nextHistory,
        _historyIndex: commandSystem.getHistoryIndex(),
      });
    }

    return {
      selectedElementId: null,
      selectedElementIds: [],
      elements: [],
      _history: [],
      _historyIndex: -1,

      selectElement: (id: string | null) => {
        set({ selectedElementId: id, selectedElementIds: id ? [id] : [] });
      },

      toggleElementSelection: (id: string) => {
        const state = get();
        const isSelected = state.selectedElementIds.includes(id);
        const nextIds = isSelected
          ? state.selectedElementIds.filter((item) => item !== id)
          : [...state.selectedElementIds, id];
        set({
          selectedElementId: nextIds[0] ?? null,
          selectedElementIds: nextIds,
        });
      },

      clearSelection: () => {
        set({ selectedElementId: null, selectedElementIds: [] });
      },

      addElement: (element: CanvasElement) => {
        executeCommand(new AddElementCommand(element));
      },

      updateElement: (id: string, updates: Partial<CanvasElement>) => {
        executeCommand(new UpdateElementCommand(id, updates));
      },

      removeElement: (id: string) => {
        const state = get();
        executeCommand(new RemoveElementCommand(id), {
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          selectedElementIds: state.selectedElementIds.filter((elementId) => elementId !== id),
        });
      },

      getElement: (id: string) => {
        const state = get();
        return state.elements.find((el: CanvasElement) => el.id === id);
      },

      duplicateElement: (id: string) => {
        const state = get();
        const elementToDuplicate = state.elements.find((el) => el.id === id);
        if (!elementToDuplicate) return;

        const duplicated: CanvasElement = {
          ...elementToDuplicate,
          id: `${elementToDuplicate.id}-copy-${Date.now()}`,
          x: elementToDuplicate.x + 24,
          y: elementToDuplicate.y + 24,
        };

        executeCommand(new AddElementCommand(duplicated), {
          selectedElementId: duplicated.id,
          selectedElementIds: [duplicated.id],
        });
      },

      undo: () => {
        const state = get();
        const context: CanvasCommandContext = { elements: state.elements };
        if (!commandSystem.undo(context)) return;

        set({
          elements: context.elements,
          _historyIndex: commandSystem.getHistoryIndex(),
        });
      },

      redo: () => {
        const state = get();
        const context: CanvasCommandContext = { elements: state.elements };
        if (!commandSystem.redo(context)) return;

        set({
          elements: context.elements,
          _historyIndex: commandSystem.getHistoryIndex(),
        });
      },

      reorderElement: (id, direction) => {
        const state = get();
        const index = state.elements.findIndex((element) => element.id === id);
        if (index === -1) return;

        const targetIndex = direction === 'up' ? index + 1 : index - 1;
        if (targetIndex < 0 || targetIndex >= state.elements.length) return;

        executeCommand(new ReorderElementCommand(id, direction));
      },

      alignSelectedElement: (alignment) => {
        const state = get();
        const selected = state.selectedElementId
          ? state.elements.find((el) => el.id === state.selectedElementId)
          : null;
        if (!selected) return;

        let updates: Partial<CanvasElement>;
        switch (alignment) {
          case 'left':
            updates = { x: 197 };
            break;
          case 'center':
            updates = { x: 197 + (400 - selected.width) / 2 };
            break;
          case 'right':
            updates = { x: 197 + 400 - selected.width };
            break;
          case 'top':
            updates = { y: 180 };
            break;
          case 'middle':
            updates = { y: 180 + (500 - selected.height) / 2 };
            break;
          case 'bottom':
            updates = { y: 180 + 500 - selected.height };
            break;
        }

        executeCommand(new UpdateElementCommand(selected.id, updates));
      },

      groupSelectedElements: () => {
        const state = get();
        if (!state.selectedElementId) return;

        const selected = state.elements.find((el) => el.id === state.selectedElementId);
        if (!selected) return;

        executeCommand(new RemoveElementCommand(selected.id));
      },

      ungroupSelectedElements: () => {
        const state = get();
        if (!state.selectedElementId) return;

        const selected = state.elements.find((el) => el.id === state.selectedElementId);
        if (!selected) return;

        executeCommand(new RemoveElementCommand(selected.id));
      },
    };
  }
);
