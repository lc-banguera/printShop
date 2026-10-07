import { AddElementCommand } from '../commands/add-element.command';
import { CommandSystem } from '../commands/command-system';
import type { CanvasCommandContext, Command } from '../commands';
import { assertPrintShopDocument } from '../document/document-manager';
import { LayerManager } from '../layers/layer-manager';
import { SelectionManager, type SelectionState } from '../selection/selection-manager';
import { TransformSystem, type CanvasAlignment, type FlipAxis, type TransformBounds } from '../transform';
import type { DesignElement, Layer, PrintShopDocument, ProductSurface } from '../types';

export class DesignEngine {
  private documentValue: PrintShopDocument;
  private readonly commandSystem = new CommandSystem<CanvasCommandContext>();
  private readonly historyContexts: CanvasCommandContext[] = [];
  private readonly layerContexts = new Map<string, CanvasCommandContext>();
  private readonly selectionManager = new SelectionManager();
  private readonly transformSystem = new TransformSystem(this.commandSystem);
  private readonly layerManager = new LayerManager(this.commandSystem);
  private selectionState: SelectionState = this.selectionManager.select(null);

  constructor(document: PrintShopDocument) {
    assertPrintShopDocument(document);
    this.documentValue = document;
  }

  get document(): PrintShopDocument {
    return this.documentValue;
  }

  get selection(): SelectionState {
    return {
      selectedElementId: this.selectionState.selectedElementId,
      selectedElementIds: [...this.selectionState.selectedElementIds],
    };
  }

  createLayer(surfaceId: ProductSurface['id'], layer: Layer): void {
    const surface = this.findSurface(surfaceId);
    if (this.documentValue.surfaces.some((candidate) =>
      candidate.layers.some((existing) => existing.id === layer.id)
    )) {
      throw new Error(`Layer is already present in the document: ${layer.id}`);
    }
    if (layer.elements.some((element) => element.zoneId !== surfaceId)) {
      throw new RangeError(`All elements in layer "${layer.id}" must belong to "${surfaceId}".`);
    }

    this.replaceSurface({
      ...surface,
      layers: [...surface.layers, { ...layer, elements: [...layer.elements] }],
    });
  }

  addElement(layerId: string, element: DesignElement): void {
    const { surface } = this.findLayer(layerId);
    if (element.zoneId !== surface.id) {
      throw new RangeError(`Element "${element.id}" does not belong to surface "${surface.id}".`);
    }
    if (this.findElement(element.id)) {
      throw new Error(`Element is already present in the document: ${element.id}`);
    }

    this.execute(new AddElementCommand(element), layerId);
  }

  select(elementId: string | null): SelectionState {
    if (elementId !== null && !this.findElement(elementId)) {
      throw new RangeError(`Element is not present in the document: ${elementId}`);
    }
    this.selectionState = this.selectionManager.select(elementId);
    return this.selection;
  }

  selectMany(elementIds: string[]): SelectionState {
    for (const elementId of elementIds) {
      if (!this.findElement(elementId)) {
        throw new RangeError(`Element is not present in the document: ${elementId}`);
      }
    }
    this.selectionState = this.selectionManager.selectMany(elementIds);
    return this.selection;
  }

  toggleSelection(elementId: string): SelectionState {
    if (!this.findElement(elementId)) {
      throw new RangeError(`Element is not present in the document: ${elementId}`);
    }
    this.selectionState = this.selectionManager.toggle(this.selectionState, elementId);
    return this.selection;
  }

  moveSelected(delta: { x: number; y: number }): boolean {
    const target = this.selectionContext();
    return target
      ? this.runTransform(target, () =>
          this.transformSystem.move(this.selection.selectedElementIds, delta, target)
        )
      : false;
  }

  scaleSelected(scaleX: number, scaleY: number): boolean {
    const target = this.selectionContext();
    return target
      ? this.runTransform(target, () =>
          this.transformSystem.scale(
            this.selection.selectedElementIds,
            scaleX,
            scaleY,
            target
          )
        )
      : false;
  }

  rotateSelected(degrees: number): boolean {
    const target = this.selectionContext();
    return target
      ? this.runTransform(target, () =>
          this.transformSystem.rotate(this.selection.selectedElementIds, degrees, target)
        )
      : false;
  }

  flipSelected(axis: FlipAxis): boolean {
    const target = this.selectionContext();
    return target
      ? this.runTransform(target, () =>
          this.transformSystem.flip(this.selection.selectedElementIds, axis, target)
        )
      : false;
  }

  alignSelected(alignment: CanvasAlignment, bounds: TransformBounds): boolean {
    const target = this.selectionContext();
    return target
      ? this.runTransform(target, () =>
          this.transformSystem.align(
            this.selection.selectedElementIds,
            alignment,
            bounds,
            target
          )
        )
      : false;
  }

  reorderElement(layerId: string, elementId: string, direction: 'up' | 'down'): boolean {
    const context = this.getLayerContext(layerId);
    return this.runTransform(context, () => this.layerManager.reorder(elementId, direction, context));
  }

  toggleElementLock(layerId: string, elementId: string): boolean {
    const context = this.getLayerContext(layerId);
    return this.runTransform(context, () => this.layerManager.toggleLock(elementId, context));
  }

  toggleElementVisibility(layerId: string, elementId: string): boolean {
    const context = this.getLayerContext(layerId);
    return this.runTransform(context, () => this.layerManager.toggleVisibility(elementId, context));
  }

  execute(command: Command<CanvasCommandContext>, layerId: string): void {
    const context = this.getLayerContext(layerId);
    this.commandSystem.execute(command, context);
    this.recordHistoryContext(context);
  }

  undo(): boolean {
    const context = this.historyContexts[this.commandSystem.getHistoryIndex()];
    return context ? this.commandSystem.undo(context) : false;
  }

  redo(): boolean {
    const context = this.historyContexts[this.commandSystem.getHistoryIndex() + 1];
    return context ? this.commandSystem.redo(context) : false;
  }

  canUndo(): boolean {
    return this.commandSystem.canUndo();
  }

  canRedo(): boolean {
    return this.commandSystem.canRedo();
  }

  private runTransform(context: CanvasCommandContext, operation: () => boolean): boolean {
    const previousIndex = this.commandSystem.getHistoryIndex();
    const changed = operation();
    if (changed && this.commandSystem.getHistoryIndex() !== previousIndex) {
      this.recordHistoryContext(context);
    }
    return changed;
  }

  private recordHistoryContext(context: CanvasCommandContext): void {
    const index = this.commandSystem.getHistoryIndex();
    this.historyContexts.length = index;
    this.historyContexts[index] = context;
  }

  private selectionContext(): CanvasCommandContext | null {
    const ids = this.selection.selectedElementIds;
    if (ids.length === 0) return null;

    const locations = ids.map((id) => this.findElement(id));
    if (locations.some((location) => location === null)) return null;
    const layerIds = [
      ...new Set(locations.flatMap((location) => (location ? [location.layer.id] : []))),
    ];
    return this.createLayerGroupContext(layerIds);
  }

  private createLayerGroupContext(layerIds: string[]): CanvasCommandContext {
    const elementLayers = new Map<string, string>();
    for (const layerId of layerIds) {
      for (const element of this.findLayer(layerId).layer.elements) {
        elementLayers.set(element.id, layerId);
      }
    }

    const thisEngine = this;
    return {
      get elements() {
        return layerIds.flatMap((layerId) => thisEngine.findLayer(layerId).layer.elements);
      },
      set elements(elements: DesignElement[]) {
        const grouped = new Map(layerIds.map((layerId) => [layerId, [] as DesignElement[]]));
        for (const element of elements) {
          const ownerLayerId = elementLayers.get(element.id);
          const ownerElements = ownerLayerId ? grouped.get(ownerLayerId) : undefined;
          if (!ownerElements) {
            throw new RangeError(`Element is not part of the selected layers: ${element.id}`);
          }
          ownerElements.push(element);
        }
        for (const layerId of layerIds) {
          thisEngine.replaceLayerElements(layerId, grouped.get(layerId) ?? []);
        }
      },
    };
  }

  private getLayerContext(layerId: string): CanvasCommandContext {
    const existing = this.layerContexts.get(layerId);
    if (existing) return existing;

    const thisEngine = this;
    const context: CanvasCommandContext = {
      get elements() {
        return thisEngine.findLayer(layerId).layer.elements;
      },
      set elements(elements: DesignElement[]) {
        thisEngine.replaceLayerElements(layerId, elements);
      },
    };
    this.layerContexts.set(layerId, context);
    return context;
  }

  private replaceLayerElements(layerId: string, elements: DesignElement[]): void {
    const { surface, layer } = this.findLayer(layerId);
    this.replaceSurface({
      ...surface,
      layers: surface.layers.map((candidate) =>
        candidate.id === layer.id ? { ...candidate, elements: [...elements] } : candidate
      ),
    });
  }

  private replaceSurface(nextSurface: ProductSurface): void {
    const nextDocument = {
      ...this.documentValue,
      surfaces: this.documentValue.surfaces.map((surface) =>
        surface.id === nextSurface.id ? nextSurface : surface
      ),
    };
    assertPrintShopDocument(nextDocument);
    this.documentValue = nextDocument;
  }

  private findSurface(surfaceId: ProductSurface['id']): ProductSurface {
    const surface = this.documentValue.surfaces.find((candidate) => candidate.id === surfaceId);
    if (!surface) throw new RangeError(`Surface is not present in the document: ${surfaceId}`);
    return surface;
  }

  private findLayer(layerId: string): { surface: ProductSurface; layer: Layer } {
    for (const surface of this.documentValue.surfaces) {
      const layer = surface.layers.find((candidate) => candidate.id === layerId);
      if (layer) return { surface, layer };
    }
    throw new RangeError(`Layer is not present in the document: ${layerId}`);
  }

  private findElement(
    elementId: string
  ): { element: DesignElement; layer: Layer } | null {
    for (const surface of this.documentValue.surfaces) {
      for (const layer of surface.layers) {
        const element = layer.elements.find((candidate) => candidate.id === elementId);
        if (element) return { element, layer };
      }
    }
    return null;
  }
}
