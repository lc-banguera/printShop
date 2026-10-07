export { DesignEngine } from './core';
export { AddElementCommand } from './commands/add-element.command';
export { CommandSystem } from './commands/command-system';
export { CompositeCommand } from './commands/composite.command';
export { RemoveElementCommand } from './commands/remove-element.command';
export { ReorderElementCommand } from './commands/reorder-element.command';
export { UpdateElementCommand } from './commands/update-element.command';
export type { CanvasCommandContext, Command } from './commands';
export { createPrintShopDocument, assertPrintShopDocument, isPrintShopDocument } from './document/document-manager';
export type { CreatePrintShopDocumentInput } from './document/document-manager';
export { deserializeDocument, serializeDocument } from './document/serializer';
export { CURRENT_DOCUMENT_SCHEMA_VERSION } from './document/schema-version';
export { LayerManager, ReorderLayerCommand, ToggleLayerLockCommand, ToggleLayerVisibilityCommand } from './layers';
export { CommandHistory } from './history';
export * from './processing';
export { SelectionManager } from './selection';
export type { SelectionState } from './selection';
export { TransformSystem } from './transform';
export {
  composeAffineTransforms,
  createAffineTransform,
  createCenteredTransform,
  invertAffineTransform,
  rotatePoint,
  transformBounds,
  transformPoint,
} from './transform';
export type {
  AffineTransform,
  AffineTransformOptions,
  CanvasAlignment,
  ElementUpdate,
  FlipAxis,
  TransformBounds,
  TransformPoint,
  TransformRectangle,
} from './transform';
export { getTool, TOOLS, TOOLS_ORDER, toolRegistry, ToolRegistry } from './tools';
export type {
  Tool,
  ToolCategory,
  ToolContext,
  ToolDescriptor,
  ToolId,
  ToolKeyboardEvent,
  ToolPointerEvent,
  ToolViewportState,
} from './tools';
export type {
  BleedConfig,
  CoordinateSystem,
  DocumentMetadata,
  DesignerCapabilities,
  DesignerCapability,
  DesignerId,
  DesignElement,
  ElementType,
  JsonValue,
  Layer,
  PrintableArea,
  PrintableZoneId,
  PrintShopDocument,
  ProductReference,
  ProductSurface,
  SafeArea,
} from './contracts';
