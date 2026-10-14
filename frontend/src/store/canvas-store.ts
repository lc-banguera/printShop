import { create } from 'zustand';
import type { CanvasState, CanvasElement } from '@/types/canvas';
import {
  AddElementCommand,
  CompositeCommand,
  CommandSystem,
  RemoveElementCommand,
  type CanvasCommandContext,
} from '@/core/design/commands';
import { LayerManager } from '@/core/design/layers';
import { SelectionManager } from '@/core/design/selection';
import { TransformSystem } from '@/core/design/transform';

function cloneElements(elements: CanvasElement[]) {
  return elements.map((element) => ({ ...element }));
}

export const useCanvasStore = create<CanvasState>(
  (
    set: (state: Partial<CanvasState> | ((state: CanvasState) => Partial<CanvasState>)) => void,
    get: () => CanvasState
  ) => {
    const commandSystem = new CommandSystem<CanvasCommandContext>();
    const layerManager = new LayerManager(commandSystem);
    const selectionManager = new SelectionManager();
    const transformSystem = new TransformSystem(commandSystem);

    function executeOperation(
      operation: (context: CanvasCommandContext) => void | boolean,
      nextState: Partial<CanvasState> = {}
    ) {
      const state = get();
      const context: CanvasCommandContext = { elements: state.elements };
      if (operation(context) === false) return;

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

    function executeCommand(
      command: Parameters<typeof commandSystem.execute>[0],
      nextState: Partial<CanvasState> = {}
    ) {
      executeOperation((context) => commandSystem.execute(command, context), nextState);
    }

    function removeElements(elementIds: string[]) {
      const state = get();
      const ids = [...new Set(elementIds)].filter((id) =>
        state.elements.some((element) => element.id === id)
      );
      if (ids.length === 0) return;

      const commands = ids.map((id) => new RemoveElementCommand(id));
      const command = commands.length === 1
        ? commands[0]
        : new CompositeCommand('Remove elements', commands);
      executeCommand(command, selectionManager.remove(state, ids));
    }

    function duplicateElements(elementIds: string[]) {
      const state = get();
      const selected = new Set(elementIds);
      const duplicates = state.elements
        .filter((element) => selected.has(element.id))
        .map((element) => ({
          ...element,
          id: `${element.id}-copy-${Date.now()}`,
          x: element.x + 24,
          y: element.y + 24,
        }));
      if (duplicates.length === 0) return;

      const commands = duplicates.map((element) => new AddElementCommand(element));
      const command = commands.length === 1
        ? commands[0]
        : new CompositeCommand('Duplicate elements', commands);
      executeCommand(
        command,
        selectionManager.selectMany(duplicates.map((element) => element.id))
      );
    }

    return {
      selectedElementId: null,
      selectedElementIds: [],
      elements: [],
      _history: [],
      _historyIndex: -1,

      selectElement: (id: string | null) => {
        set(selectionManager.select(id));
      },

      selectElements: (ids: string[]) => {
        set(selectionManager.selectMany(ids));
      },

      toggleElementSelection: (id: string) => {
        set(selectionManager.toggle(get(), id));
      },

      clearSelection: () => {
        set(selectionManager.select(null));
      },

      addElement: (element: CanvasElement) => {
        executeCommand(new AddElementCommand(element));
      },

      updateElement: (id: string, updates: Partial<CanvasElement>) => {
        executeOperation((context) =>
          transformSystem.updateElements([{ elementId: id, updates }], context)
        );
      },

      updateElements: (updates) => {
        executeOperation((context) => transformSystem.updateElements(updates, context));
      },

      removeElement: (id: string) => {
        removeElements([id]);
      },

      removeElements: (ids) => {
        removeElements(ids);
      },

      getElement: (id: string) => {
        const state = get();
        return state.elements.find((el: CanvasElement) => el.id === id);
      },

      duplicateElement: (id: string) => {
        duplicateElements([id]);
      },

      duplicateElements: (ids) => {
        duplicateElements(ids);
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
        executeOperation((context) => layerManager.reorder(id, direction, context));
      },

      toggleElementLock: (id) => {
        executeOperation((context) => layerManager.toggleLock(id, context));
      },

      toggleElementVisibility: (id) => {
        executeOperation((context) => layerManager.toggleVisibility(id, context));
      },

      moveElements: (ids, delta) => {
        executeOperation((context) => transformSystem.move(ids, delta, context));
      },

      scaleElements: (ids, scaleX, scaleY) => {
        executeOperation((context) => transformSystem.scale(ids, scaleX, scaleY, context));
      },

      rotateElements: (ids, degrees) => {
        executeOperation((context) => transformSystem.rotate(ids, degrees, context));
      },

      flipElements: (ids, axis) => {
        executeOperation((context) => transformSystem.flip(ids, axis, context));
      },

      alignElements: (ids, alignment, bounds) => {
        executeOperation((context) => transformSystem.align(ids, alignment, bounds, context));
      },

      centerElements: (ids, bounds) => {
        executeOperation((context) => transformSystem.center(ids, bounds, context));
      },

      alignSelectedElement: (alignment, bounds) => {
        const state = get();
        executeOperation((context) =>
          transformSystem.align(state.selectedElementIds, alignment, bounds, context)
        );
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
