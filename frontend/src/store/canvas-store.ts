import { create } from 'zustand';
import type { CanvasState, CanvasElement } from '@/types/canvas';

function cloneElements(elements: CanvasElement[]) {
  return elements.map((element) => ({ ...element }));
}

export const useCanvasStore = create<CanvasState>(
  (
    set: (state: Partial<CanvasState> | ((state: CanvasState) => Partial<CanvasState>)) => void,
    get: () => CanvasState
  ) => ({
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
      const state = get();
      const nextElements = [...state.elements, element];
      set({
        elements: nextElements,
        _history: [...state._history, { elements: cloneElements(state.elements) }],
        _historyIndex: state._historyIndex + 1,
      });
    },

    updateElement: (id: string, updates: Partial<CanvasElement>) => {
      const state = get();
      const nextElements = state.elements.map((el: CanvasElement) =>
        el.id === id ? { ...el, ...updates } : el
      );
      set({
        elements: nextElements,
        _history: [...state._history, { elements: cloneElements(state.elements) }],
        _historyIndex: state._historyIndex + 1,
      });
    },

    removeElement: (id: string) => {
      const state = get();
      const nextElements = state.elements.filter((el: CanvasElement) => el.id !== id);
      set({
        elements: nextElements,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        selectedElementIds: state.selectedElementIds.filter((elementId) => elementId !== id),
        _history: [...state._history, { elements: cloneElements(state.elements) }],
        _historyIndex: state._historyIndex + 1,
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

      const nextElements = [...state.elements, duplicated];
      set({
        elements: nextElements,
        selectedElementId: duplicated.id,
        selectedElementIds: [duplicated.id],
        _history: [...state._history, { elements: cloneElements(state.elements) }],
        _historyIndex: state._historyIndex + 1,
      });
    },

    undo: () => {
      const state = get();
      if (state._historyIndex < 0) return;
      const previousEntry = state._history[state._historyIndex];
      if (!previousEntry) return;
      const nextIndex = state._historyIndex - 1;
      set({
        elements: cloneElements(previousEntry.elements),
        _historyIndex: nextIndex,
      });
    },

    redo: () => {
      const state = get();
      const nextIndex = state._historyIndex + 1;
      const nextEntry = state._history[nextIndex];
      if (!nextEntry) return;
      set({
        elements: cloneElements(nextEntry.elements),
        _historyIndex: nextIndex,
      });
    },

    alignSelectedElement: (alignment) => {
      const state = get();
      const selected = state.selectedElementId ? state.elements.find((el) => el.id === state.selectedElementId) : null;
      if (!selected) return;

      const nextElements = state.elements.map((element) => {
        if (element.id !== selected.id) return element;
        switch (alignment) {
          case 'left':
            return { ...element, x: 197 };
          case 'center':
            return { ...element, x: 197 + (400 - element.width) / 2 };
          case 'right':
            return { ...element, x: 197 + 400 - element.width };
          case 'top':
            return { ...element, y: 180 };
          case 'middle':
            return { ...element, y: 180 + (500 - element.height) / 2 };
          case 'bottom':
            return { ...element, y: 180 + 500 - element.height };
          default:
            return element;
        }
      });

      set({
        elements: nextElements,
        _history: [...state._history, { elements: cloneElements(state.elements) }],
        _historyIndex: state._historyIndex + 1,
      });
    },

    groupSelectedElements: () => {
      const state = get();
      if (!state.selectedElementId) return;
      const selected = state.elements.find((el) => el.id === state.selectedElementId);
      if (!selected) return;

      const nextElements = state.elements.filter((element) => element.id !== selected.id);
      set({
        elements: nextElements,
        _history: [...state._history, { elements: cloneElements(state.elements) }],
        _historyIndex: state._historyIndex + 1,
      });
    },

    ungroupSelectedElements: () => {
      const state = get();
      if (!state.selectedElementId) return;
      const selected = state.elements.find((el) => el.id === state.selectedElementId);
      if (!selected) return;

      const nextElements = state.elements.filter((element) => element.id !== selected.id);
      set({
        elements: nextElements,
        _history: [...state._history, { elements: cloneElements(state.elements) }],
        _historyIndex: state._historyIndex + 1,
      });
    },
  })
);
