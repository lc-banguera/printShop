import type { DesignerCapability } from '../types/capabilities';
import type { Tool, ToolDescriptor, ToolId } from './tool';
import { ToolRegistry } from './tool-registry';

export const TOOLS: Record<string, ToolDescriptor> = {
  SELECT: {
    id: 'select',
    name: 'Seleccionar',
    icon: '✓',
    description: 'Selecciona y mueve elementos',
    category: 'selection',
    cursor: 'default',
  },
  RECTANGLE: {
    id: 'rectangle',
    name: 'Rectángulo',
    icon: '▭',
    description: 'Dibuja rectángulos',
    category: 'shape',
    cursor: 'crosshair',
  },
  ELLIPSE: {
    id: 'ellipse',
    name: 'Elipse',
    icon: '○',
    description: 'Dibuja elipses y círculos',
    category: 'shape',
    cursor: 'crosshair',
  },
  LINE: {
    id: 'line',
    name: 'Línea',
    icon: '—',
    description: 'Dibuja líneas',
    category: 'drawing',
    cursor: 'crosshair',
  },
  TEXT: {
    id: 'text',
    name: 'Texto',
    icon: 'T',
    description: 'Agrega texto',
    category: 'asset',
    cursor: 'text',
  },
  IMAGE: {
    id: 'image',
    name: 'Imagen',
    icon: '🖼️',
    description: 'Carga imágenes',
    category: 'asset',
    cursor: 'default',
  },
  HAND: {
    id: 'hand',
    name: 'Mano',
    icon: '✋',
    description: 'Navegación y panorámica',
    category: 'view',
    cursor: 'grab',
  },
  ZOOM: {
    id: 'zoom',
    name: 'Zoom',
    icon: '🔍',
    description: 'Acerca o aleja el canvas',
    category: 'view',
    cursor: 'zoom-in',
  },
};

export const TOOLS_ORDER = [
  TOOLS.SELECT,
  TOOLS.RECTANGLE,
  TOOLS.ELLIPSE,
  TOOLS.LINE,
  TOOLS.TEXT,
  TOOLS.IMAGE,
  TOOLS.HAND,
  TOOLS.ZOOM,
] as const;

export function getTool(id: string): ToolDescriptor | undefined {
  return TOOLS_ORDER.find((tool) => tool.id === id);
}

const REQUIRED_CAPABILITIES: Record<ToolId, readonly DesignerCapability[]> = {
  select: ['selection'],
  rectangle: ['shapeCreation'],
  ellipse: ['shapeCreation'],
  line: ['shapeCreation'],
  text: ['text'],
  image: ['imageUpload'],
  hand: ['viewportNavigation'],
  zoom: ['viewportNavigation'],
};

function registerConfiguredTool(registry: ToolRegistry, descriptor: ToolDescriptor): void {
  const tool: Tool = {
    ...descriptor,
    requiredCapabilities: REQUIRED_CAPABILITIES[descriptor.id],
  };

  registry.register(tool);
}

export const toolRegistry = new ToolRegistry();
TOOLS_ORDER.forEach((tool) => registerConfiguredTool(toolRegistry, tool));
