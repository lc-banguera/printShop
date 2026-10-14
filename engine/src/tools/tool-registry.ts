import type { DesignerCapabilities } from '../types/capabilities';
import type { ToolContext } from './tool-context';
import type { Tool, ToolId } from './tool';

export class ToolRegistry {
  private readonly tools = new Map<ToolId, Tool>();

  register(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool is already registered: ${tool.id}`);
    }

    this.tools.set(tool.id, tool);
  }

  unregister(toolId: ToolId): boolean {
    return this.tools.delete(toolId);
  }

  getTool(toolId: ToolId): Tool | undefined {
    return this.tools.get(toolId);
  }

  getAvailableTools(capabilities: DesignerCapabilities): Tool[] {
    return [...this.tools.values()].filter((tool) =>
      tool.requiredCapabilities.every((capability) => capabilities.enabled.includes(capability))
    );
  }

  isAvailable(toolId: ToolId, capabilities: DesignerCapabilities): boolean {
    const tool = this.getTool(toolId);
    return Boolean(
      tool &&
        tool.requiredCapabilities.every((capability) => capabilities.enabled.includes(capability))
    );
  }

  transition<TCommandContext>(
    activeToolId: ToolId | null,
    nextToolId: ToolId,
    context: ToolContext<TCommandContext>
  ): void {
    const nextTool = this.getTool(nextToolId);
    if (!nextTool) {
      throw new Error(`Tool is not registered: ${nextToolId}`);
    }

    if (!this.isAvailable(nextToolId, context.capabilities)) {
      throw new Error(
        `Tool "${nextToolId}" is not available for designer "${context.capabilities.designer}"`
      );
    }

    if (activeToolId === nextToolId) return;

    if (activeToolId) {
      this.getTool(activeToolId)?.onDeactivate?.(context);
    }
    nextTool.onActivate?.(context);
  }
}
