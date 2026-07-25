/**
 * Available tools configuration for the Designer
 * This is the source of truth for all available tools
 */

import type { Tool } from '@/types/tools';

export const TOOLS: Record<string, Tool> = {
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

/**
 * List of tools in order for toolbar display
 */
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

/**
 * Get tool by ID
 */
export function getTool(id: string): Tool | undefined {
  return TOOLS_ORDER.find((tool) => tool.id === id);
}
