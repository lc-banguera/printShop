export interface SelectionState {
  selectedElementId: string | null;
  selectedElementIds: string[];
}

export class SelectionManager {
  select(elementId: string | null): SelectionState {
    return {
      selectedElementId: elementId,
      selectedElementIds: elementId ? [elementId] : [],
    };
  }

  selectMany(elementIds: string[]): SelectionState {
    const selectedElementIds = [...new Set(elementIds)];
    return {
      selectedElementId: selectedElementIds[0] ?? null,
      selectedElementIds,
    };
  }

  toggle(state: SelectionState, elementId: string): SelectionState {
    const selectedElementIds = state.selectedElementIds.includes(elementId)
      ? state.selectedElementIds.filter((id) => id !== elementId)
      : [...state.selectedElementIds, elementId];
    return this.selectMany(selectedElementIds);
  }

  remove(state: SelectionState, elementIds: string[]): SelectionState {
    const removed = new Set(elementIds);
    return this.selectMany(state.selectedElementIds.filter((id) => !removed.has(id)));
  }
}
