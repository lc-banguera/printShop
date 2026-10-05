import type { DesignerCapability } from '../types/capabilities';
import type { ToolContext } from './tool-context';

export type ToolId =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'image'
  | 'hand'
  | 'zoom';

export type ToolCategory = 'selection' | 'shape' | 'drawing' | 'view' | 'asset';

export interface ToolDescriptor {
  id: ToolId;
  name: string;
  icon: string;
  description: string;
  category: ToolCategory;
  cursor: string;
}

export interface ToolPointerEvent {
  x: number;
  y: number;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export interface ToolKeyboardEvent {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface Tool {
  id: ToolId;
  name: string;
  icon: string;
  description: string;
  category: ToolCategory;
  cursor: string;
  requiredCapabilities: readonly DesignerCapability[];
  onActivate?<TCommandContext>(context: ToolContext<TCommandContext>): void;
  onDeactivate?<TCommandContext>(context: ToolContext<TCommandContext>): void;
  onPointerDown?<TCommandContext>(
    event: ToolPointerEvent,
    context: ToolContext<TCommandContext>
  ): void;
  onPointerMove?<TCommandContext>(
    event: ToolPointerEvent,
    context: ToolContext<TCommandContext>
  ): void;
  onPointerUp?<TCommandContext>(
    event: ToolPointerEvent,
    context: ToolContext<TCommandContext>
  ): void;
  onKeyDown?<TCommandContext>(
    event: ToolKeyboardEvent,
    context: ToolContext<TCommandContext>
  ): void;
}
