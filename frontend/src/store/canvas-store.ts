import { create } from 'zustand';
import type { CanvasState, CanvasElement } from '@/types/canvas';

export const useCanvasStore = create<CanvasState>(
  (
    set: (state: Partial<CanvasState> | ((state: CanvasState) => Partial<CanvasState>)) => void,
    get: () => CanvasState
  ) => ({
    selectedElementId: null,
    elements: [
      {
        id: 'rect-1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 150,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        fill: '#0078d4',
        opacity: 1,
        name: 'Rectángulo 1',
        locked: false,
        visible: true,
      },
      {
        id: 'rect-2',
        type: 'rectangle',
        x: 350,
        y: 200,
        width: 200,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        fill: '#d10a6b',
        opacity: 1,
        name: 'Rectángulo 2',
        locked: false,
        visible: true,
      },
    ],

    selectElement: (id: string | null) => {
      set({ selectedElementId: id });
    },

    addElement: (element: CanvasElement) => {
      set((state: CanvasState) => ({
        elements: [...state.elements, element],
      }));
    },

    updateElement: (id: string, updates: Partial<CanvasElement>) => {
      set((state: CanvasState) => ({
        elements: state.elements.map((el: CanvasElement) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      }));
    },

    removeElement: (id: string) => {
      set((state: CanvasState) => ({
        elements: state.elements.filter((el: CanvasElement) => el.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      }));
    },

    getElement: (id: string) => {
      const state = get();
      return state.elements.find((el: CanvasElement) => el.id === id);
    },
  })
);
