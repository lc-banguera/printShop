import type { CanvasState } from '@/types/canvas';
import type { ProductDefinition } from '@/types/product';
import { CANVAS_CONFIG } from '@/features/designer/services/canvas-config';
import type { DocumentMetadata, PrintShopDocument } from '../types';
import { createPrintShopDocument } from './document-manager';

export interface CreateDocumentFromCanvasStateInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  product: ProductDefinition;
  canvasState: Pick<CanvasState, 'elements'>;
  metadata?: DocumentMetadata;
}

export function createDocumentFromCanvasState(
  input: CreateDocumentFromCanvasStateInput
): PrintShopDocument {
  const surfaces = Object.values(input.product.printableAreas).map((printableArea) => ({
    id: printableArea.id,
    name: printableArea.name,
    printableArea: { ...printableArea },
    layers: [
      {
        id: `${printableArea.id}-artwork`,
        name: 'Artwork',
        order: 0,
        locked: false,
        visible: true,
        elements: input.canvasState.elements
          .filter((element) => element.zoneId === printableArea.id)
          .map((element) => ({ ...element })),
      },
    ],
    coordinateSystem: {
      origin: 'top-left' as const,
      unit: 'px' as const,
      width: CANVAS_CONFIG.ARTBOARD_WIDTH,
      height: CANVAS_CONFIG.ARTBOARD_HEIGHT,
    },
  }));

  return createPrintShopDocument({
    id: input.id,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    product: { id: input.product.id },
    surfaces,
    metadata: input.metadata,
  });
}
